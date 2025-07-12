/**
 * Platform Error Result Validation Schema
 *
 * Validates PlatformErrorResult objects ensuring complete platform error
 * results maintain consistency with recovery actions and error handling.
 *
 * @module PlatformErrorResultSchema
 */

import { z } from 'zod';
import { PlatformErrorContextSchema } from './PlatformErrorContextSchema';
import { PlatformErrorSchema } from './PlatformErrorSchema';
import { RecoveryActionSchema } from './RecoveryActionSchema';

/**
 * Zod schema for validating PlatformErrorResult objects
 *
 * Validates complete platform error results including error details,
 * context, recovery actions, and error handling metadata.
 *
 * @example
 * ```typescript
 * const errorResult = PlatformErrorResultSchema.parse({
 *   error: {
 *     type: 'DETECTION_FAILED',
 *     message: 'Platform detection failed',
 *     code: 'PLAT_001',
 *     severity: 'ERROR',
 *     recoverable: true,
 *     suggestions: ['Check environment']
 *   },
 *   context: {
 *     operationName: 'detectPlatformType',
 *     environmentInfo: { hasWindow: false },
 *     executionContext: 'main-process'
 *   },
 *   recoveryActions: [{
 *     name: 'fallback-detection',
 *     description: 'Use fallback detection method',
 *     automated: true,
 *     priority: 'HIGH'
 *   }],
 *   handled: true,
 *   retryable: true
 * });
 * ```
 */
export const PlatformErrorResultSchema = z
  .object({
    /** The structured error information */
    error: PlatformErrorSchema,
    /** Environmental and operational context */
    context: PlatformErrorContextSchema,
    /** Available recovery actions */
    recoveryActions: z
      .array(RecoveryActionSchema)
      .max(10, 'Too many recovery actions (maximum 10 allowed)')
      .refine(
        actions => {
          // Check for unique recovery action names
          const names = actions.map(a => a.name);
          const uniqueNames = new Set(names);
          return uniqueNames.size === names.length;
        },
        { message: 'Recovery actions must have unique names' },
      ),
    /** Whether the error has been handled by the system */
    handled: z.boolean(),
    /** Whether the operation that caused this error can be retried */
    retryable: z.boolean(),
    /** Number of retry attempts made (if applicable) */
    retryCount: z
      .number()
      .int('Retry count must be an integer')
      .min(0, 'Retry count cannot be negative')
      .max(10, 'Retry count seems unreasonably high')
      .optional(),
    /** Timestamp when error handling was completed */
    handlingCompletedAt: z
      .number()
      .int('Handling completion timestamp must be an integer')
      .min(0, 'Handling completion timestamp cannot be negative')
      .optional(),
    /** Resolution status of the error */
    resolution: z.enum(['PENDING', 'RESOLVED', 'ESCALATED', 'IGNORED']).optional(),
  })
  .strict()
  .refine(
    data => {
      // If error is not recoverable, it should not be retryable
      return !(!data.error.recoverable && data.retryable);
    },
    {
      message: 'Non-recoverable errors should not be marked as retryable',
      path: ['retryable'],
    },
  )
  .refine(
    data => {
      // If error is handled, there should be a completion timestamp
      return !(data.handled && !data.handlingCompletedAt);
    },
    {
      message: 'Handled errors should have a handling completion timestamp',
      path: ['handlingCompletedAt'],
    },
  )
  .refine(
    data => {
      // If there's a retry count, the error should be retryable
      return !(data.retryCount !== undefined && !data.retryable);
    },
    {
      message: 'Retry count can only be set for retryable errors',
      path: ['retryCount'],
    },
  )
  .refine(
    data => {
      // Critical errors should have at least one recovery action
      return !(data.error.severity === 'CRITICAL' && data.recoveryActions.length === 0);
    },
    {
      message: 'Critical errors should have at least one recovery action',
      path: ['recoveryActions'],
    },
  )
  .refine(
    data => {
      // Handling completion timestamp should be after error timestamp
      return !(data.handlingCompletedAt && data.handlingCompletedAt < data.error.timestamp);
    },
    {
      message: 'Handling completion timestamp should be after error timestamp',
      path: ['handlingCompletedAt'],
    },
  );
