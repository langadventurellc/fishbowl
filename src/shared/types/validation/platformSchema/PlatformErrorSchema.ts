/**
 * Platform Error Validation Schema
 *
 * Validates PlatformError objects ensuring structured error information
 * maintains consistency and provides helpful error context.
 *
 * @module PlatformErrorSchema
 */

import { z } from 'zod';
import { PlatformErrorTypeSchema } from './PlatformErrorTypeSchema';

/**
 * Zod schema for validating PlatformError objects
 *
 * Validates structured platform error information with error classification,
 * context, and recovery suggestions.
 *
 * @example
 * ```typescript
 * const error = PlatformErrorSchema.parse({
 *   type: 'DETECTION_FAILED',
 *   message: 'Unable to detect platform type',
 *   code: 'PLAT_DET_001',
 *   timestamp: Date.now(),
 *   severity: 'ERROR',
 *   recoverable: true,
 *   suggestions: ['Check if running in supported environment']
 * });
 * ```
 */
export const PlatformErrorSchema = z
  .object({
    /** Type/category of the platform error */
    type: PlatformErrorTypeSchema,
    /** Human-readable error message */
    message: z
      .string()
      .min(1, 'Error message cannot be empty')
      .max(500, 'Error message is too long')
      .refine(
        message => {
          // Security check for error messages
          return !/[<>'"&]/.test(message);
        },
        { message: 'Error message contains potentially unsafe characters' },
      ),
    /** Unique error code for categorization */
    code: z
      .string()
      .min(1, 'Error code cannot be empty')
      .max(50, 'Error code is too long')
      .regex(
        /^[A-Z_0-9]+$/,
        'Error code must contain only uppercase letters, underscores, and numbers',
      ),
    /** Timestamp when error occurred */
    timestamp: z
      .number()
      .int('Timestamp must be an integer')
      .min(0, 'Timestamp cannot be negative'),
    /** Severity level of the error */
    severity: z.enum(['WARNING', 'ERROR', 'CRITICAL'], {
      errorMap: () => ({ message: 'Severity must be WARNING, ERROR, or CRITICAL' }),
    }),
    /** Whether the error condition is recoverable */
    recoverable: z.boolean(),
    /** Suggested actions for error recovery */
    suggestions: z
      .array(z.string())
      .max(10, 'Too many error suggestions (maximum 10 allowed)')
      .refine(
        suggestions => {
          return suggestions.every(suggestion => {
            return suggestion.length > 0 && suggestion.length <= 200 && !/[<>'"&]/.test(suggestion);
          });
        },
        {
          message: 'Suggestions must be 1-200 characters and contain no unsafe characters',
        },
      ),
    /** Stack trace if available (for debugging) */
    stack: z
      .string()
      .max(5000, 'Stack trace is too long')
      .optional()
      .refine(
        stack => {
          if (!stack) return true;
          // Basic validation that stack trace looks reasonable
          return stack.includes('\n') || stack.includes('at ');
        },
        { message: 'Stack trace format appears invalid' },
      ),
    /** Additional error details */
    details: z
      .record(z.string(), z.unknown())
      .optional()
      .refine(
        details => {
          if (!details) return true;
          // Limit details to prevent memory issues
          const keys = Object.keys(details);
          return keys.length <= 20;
        },
        { message: 'Error details cannot have more than 20 properties' },
      ),
  })
  .strict()
  .refine(
    data => {
      // Critical errors should not be marked as recoverable
      return !(data.severity === 'CRITICAL' && data.recoverable);
    },
    {
      message: 'Critical errors cannot be marked as recoverable',
      path: ['recoverable'],
    },
  )
  .refine(
    data => {
      // If error is recoverable, there should be suggestions
      return !(data.recoverable && data.suggestions.length === 0);
    },
    {
      message: 'Recoverable errors should include recovery suggestions',
      path: ['suggestions'],
    },
  );
