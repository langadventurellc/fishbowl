/**
 * Platform Detection Result Validation Schema
 *
 * Validates PlatformDetectionResult objects ensuring data integrity and consistency
 * for platform detection operation results.
 *
 * @module PlatformDetectionResultSchema
 */

import { z } from 'zod';
import { PlatformTypeSchema } from './PlatformTypeSchema';
import { TimestampSchema } from './TimestampSchema';

/**
 * Zod schema for validating PlatformDetectionResult objects
 *
 * Validates platform detection operation results with confidence bounds,
 * detection methods, and metadata consistency.
 *
 * @example
 * ```typescript
 * const result = PlatformDetectionResultSchema.parse({
 *   platformType: PlatformType.ELECTRON,
 *   success: true,
 *   confidence: 95,
 *   timestamp: Date.now(),
 *   detectionMethod: 'electronAPI-check',
 *   metadata: { apiVersion: '1.0.0' }
 * });
 * ```
 */
export const PlatformDetectionResultSchema = z
  .object({
    /** Detected platform type */
    platformType: PlatformTypeSchema,
    /** Whether the detection was successful */
    success: z.boolean(),
    /** Confidence level of the detection (0-100) */
    confidence: z
      .number()
      .int('Confidence must be an integer')
      .min(0, 'Confidence cannot be negative')
      .max(100, 'Confidence cannot exceed 100'),
    /** Timestamp when detection was performed */
    timestamp: TimestampSchema,
    /** Method used for detection */
    detectionMethod: z
      .string()
      .min(1, 'Detection method cannot be empty')
      .max(100, 'Detection method is too long')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Detection method must contain only alphanumeric characters, underscores, and hyphens',
      ),
    /** Additional context or metadata from detection */
    metadata: z
      .record(z.string(), z.unknown())
      .optional()
      .refine(
        metadata => {
          if (!metadata) return true;
          // Limit metadata size to prevent memory issues
          const keys = Object.keys(metadata);
          return keys.length <= 50;
        },
        { message: 'Metadata cannot have more than 50 properties' },
      ),
  })
  .strict()
  .refine(
    data => {
      // If detection failed, confidence should be lower
      return !(!data.success && data.confidence > 50);
    },
    {
      message:
        'Failed detection should have confidence <= 50, successful detection should have higher confidence',
      path: ['confidence'],
    },
  );
