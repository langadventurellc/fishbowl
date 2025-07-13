/**
 * Platform Method Result Validation Schema
 *
 * Validates PlatformMethodResult objects ensuring individual platform detection
 * method results maintain data integrity and performance metrics.
 *
 * @module PlatformMethodResultSchema
 */

import { z } from 'zod';
import { TimestampSchema } from './TimestampSchema';

/**
 * Zod schema for validating PlatformMethodResult objects
 *
 * Validates individual platform detection method results with evidence
 * validation and performance metrics tracking.
 *
 * @example
 * ```typescript
 * const methodResult = PlatformMethodResultSchema.parse({
 *   methodName: 'isElectronPlatform',
 *   result: true,
 *   confidence: 100,
 *   executionTime: 0.5,
 *   evidence: ['window.electronAPI exists', 'process.versions.electron defined'],
 *   timestamp: Date.now()
 * });
 * ```
 */
export const PlatformMethodResultSchema = z
  .object({
    /** Name of the detection method */
    methodName: z
      .string()
      .min(1, 'Method name cannot be empty')
      .max(100, 'Method name is too long')
      .regex(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/, 'Method name must be a valid JavaScript identifier'),
    /** Boolean result of the detection method */
    result: z.boolean(),
    /** Confidence level of this specific method (0-100) */
    confidence: z
      .number()
      .int('Confidence must be an integer')
      .min(0, 'Confidence cannot be negative')
      .max(100, 'Confidence cannot exceed 100'),
    /** Execution time of the method in milliseconds */
    executionTime: z
      .number()
      .min(0, 'Execution time cannot be negative')
      .max(1000, 'Execution time seems unreasonably high (>1000ms)')
      .refine(
        time => {
          // Precision check - execution time should have reasonable precision
          return Number.isFinite(time) && time < Number.MAX_SAFE_INTEGER;
        },
        { message: 'Execution time must be a finite number' },
      ),
    /** Evidence or reasons for the detection result */
    evidence: z
      .array(z.string())
      .min(0, 'Evidence array cannot be negative length')
      .max(20, 'Too many evidence items (maximum 20 allowed)')
      .refine(
        evidence => {
          // Validate each evidence item
          return evidence.every(item => {
            return (
              item.length > 0 && item.length <= 200 && !item.includes('\n') && !/[<>'"&]/.test(item)
            );
          });
        },
        {
          message:
            'Evidence items must be 1-200 characters, single line, and contain no unsafe characters',
        },
      ),
    /** Timestamp when method was executed */
    timestamp: TimestampSchema,
    /** Optional error information if method failed */
    error: z
      .string()
      .max(500, 'Error message is too long')
      .optional()
      .refine(
        error => {
          if (!error) return true;
          // Security check for error messages
          return !/[<>'"&]/.test(error);
        },
        { message: 'Error message contains potentially unsafe characters' },
      ),
  })
  .strict()
  .refine(
    data => {
      // If result is false, confidence should typically be lower
      // unless we have high confidence that the platform is NOT present
      return !(!data.result && data.confidence > 90 && data.evidence.length === 0);
    },
    {
      message: 'High confidence negative results should include supporting evidence',
      path: ['evidence'],
    },
  )
  .refine(
    data => {
      // If there's an error, the result interpretation may be uncertain
      return !(data.error && data.confidence > 50);
    },
    {
      message: 'Methods with errors should have lower confidence in their results',
      path: ['confidence'],
    },
  );
