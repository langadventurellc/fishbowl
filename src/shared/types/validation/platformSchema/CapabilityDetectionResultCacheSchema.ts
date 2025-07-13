/**
 * Capability Detection Result Cache Entry Validation Schema
 *
 * Validates CapabilityDetectionResult objects used in caching to ensure
 * cache data integrity and consistent structure for capability detection results.
 *
 * @module CapabilityDetectionResultCacheSchema
 */

import { z } from 'zod';
import { TimestampSchema } from './TimestampSchema';

/**
 * Zod schema for validating capability detection results used in caching
 *
 * This schema validates the CapabilityDetectionResult interface structure
 * that is actually used by the CapabilityManager for caching operations.
 *
 * @example
 * ```typescript
 * const cacheEntry = CapabilityDetectionResultCacheSchema.parse({
 *   capability: { id: 'secure-storage', name: 'Secure Storage' },
 *   available: true,
 *   detectionTimeMs: 1.5,
 *   detectionMethod: 'keytar-detector',
 *   evidence: ['keytar module loaded', 'system keychain accessible'],
 *   requiredPermissions: ['system:keychain'],
 *   permissionsGranted: true,
 *   timestamp: Date.now()
 * });
 * ```
 */
export const CapabilityDetectionResultCacheSchema = z
  .object({
    /** The capability that was tested */
    capability: z
      .object({
        id: z
          .string()
          .min(1, 'Capability ID cannot be empty')
          .max(100, 'Capability ID is too long')
          .regex(
            /^[a-z0-9-_.]+$/,
            'Capability ID must contain only lowercase letters, numbers, hyphens, dots, and underscores',
          ),
        name: z
          .string()
          .min(1, 'Capability name cannot be empty')
          .max(200, 'Capability name is too long'),
        description: z.string().optional(),
        category: z.string().optional(),
        version: z.string().optional(),
      })
      .strict(),

    /** Whether the capability is available */
    available: z.boolean(),

    /** Time taken to detect capability in milliseconds */
    detectionTimeMs: z
      .number()
      .min(0, 'Detection time cannot be negative')
      .max(10000, 'Detection time seems unreasonably high (>10000ms)')
      .refine(time => Number.isFinite(time), { message: 'Detection time must be a finite number' }),

    /** Method used to detect the capability */
    detectionMethod: z
      .string()
      .min(1, 'Detection method cannot be empty')
      .max(100, 'Detection method name is too long')
      .regex(
        /^[a-z0-9-_]+$/,
        'Detection method must contain only lowercase letters, numbers, hyphens, and underscores',
      ),

    /** Evidence gathered during detection */
    evidence: z
      .array(
        z
          .string()
          .min(1, 'Evidence item cannot be empty')
          .max(500, 'Evidence item is too long')
          .refine(item => !item.includes('\n') && !/[<>'"&]/.test(item), {
            message: 'Evidence items must be single line and contain no unsafe characters',
          }),
      )
      .max(50, 'Too many evidence items (maximum 50 allowed)'),

    /** Any warnings about the capability */
    warnings: z
      .array(
        z
          .string()
          .min(1, 'Warning message cannot be empty')
          .max(500, 'Warning message is too long')
          .refine(warning => !/[<>'"&]/.test(warning), {
            message: 'Warning messages contain potentially unsafe characters',
          }),
      )
      .max(20, 'Too many warnings (maximum 20 allowed)')
      .optional(),

    /** Permissions required for this capability */
    requiredPermissions: z
      .array(
        z
          .string()
          .min(1, 'Permission string cannot be empty')
          .max(200, 'Permission string is too long')
          .regex(
            /^[a-zA-Z0-9:._-]+$/,
            'Permission strings must contain only alphanumeric characters, colons, dots, underscores, and hyphens',
          ),
      )
      .max(30, 'Too many required permissions (maximum 30 allowed)'),

    /** Whether permissions are currently granted */
    permissionsGranted: z.boolean(),

    /** Fallback options if capability is not available */
    fallbackOptions: z
      .array(
        z
          .string()
          .min(1, 'Fallback option cannot be empty')
          .max(500, 'Fallback option is too long'),
      )
      .max(20, 'Too many fallback options (maximum 20 allowed)')
      .optional(),

    /** When this detection was performed */
    timestamp: TimestampSchema,
  })
  .strict()
  .refine(
    data => {
      // If capability is available, there should be evidence
      return !(data.available && data.evidence.length === 0);
    },
    {
      message: 'Available capabilities should have supporting evidence',
      path: ['evidence'],
    },
  )
  .refine(
    data => {
      // If permissions are required but not granted, capability shouldn't be available
      return !(data.requiredPermissions.length > 0 && !data.permissionsGranted && data.available);
    },
    {
      message:
        'Capabilities requiring permissions should not be available without granted permissions',
      path: ['available'],
    },
  )
  .refine(
    data => {
      // Detection time should be reasonable for cached results
      return data.detectionTimeMs <= 5000;
    },
    {
      message: 'Detection time for cache entries should not exceed 5000ms',
      path: ['detectionTimeMs'],
    },
  );
