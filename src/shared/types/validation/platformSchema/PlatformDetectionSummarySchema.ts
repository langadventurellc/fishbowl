/**
 * Platform Detection Summary Validation Schema
 *
 * Validates PlatformDetectionSummary objects ensuring comprehensive platform
 * detection operation summaries maintain data integrity and consistency.
 *
 * @module PlatformDetectionSummarySchema
 */

import { z } from 'zod';
import { PlatformDetectionResultSchema } from './PlatformDetectionResultSchema';
import { PlatformDetectionContextSchema } from './PlatformDetectionContextSchema';
import { PlatformMethodResultSchema } from './PlatformMethodResultSchema';

/**
 * Zod schema for validating PlatformDetectionSummary objects
 *
 * Validates comprehensive summaries of all platform detection operations
 * including overall results, context, and individual method results.
 *
 * @example
 * ```typescript
 * const summary = PlatformDetectionSummarySchema.parse({
 *   overallResult: { platformType: PlatformType.ELECTRON, success: true, ... },
 *   context: { hasWindow: true, hasElectronAPI: true, ... },
 *   methodResults: [
 *     { methodName: 'isElectronPlatform', result: true, ... },
 *     { methodName: 'isCapacitorPlatform', result: false, ... }
 *   ],
 *   totalExecutionTime: 2.5,
 *   detectionStartTime: Date.now() - 3,
 *   detectionEndTime: Date.now()
 * });
 * ```
 */
export const PlatformDetectionSummarySchema = z
  .object({
    /** Overall platform detection result */
    overallResult: PlatformDetectionResultSchema,
    /** Environmental context during detection */
    context: PlatformDetectionContextSchema,
    /** Results from individual detection methods */
    methodResults: z
      .array(PlatformMethodResultSchema)
      .min(1, 'At least one method result is required')
      .max(50, 'Too many method results (maximum 50 allowed)')
      .refine(
        results => {
          // Check for unique method names
          const methodNames = results.map(r => r.methodName);
          const uniqueNames = new Set(methodNames);
          return uniqueNames.size === methodNames.length;
        },
        { message: 'Method results must have unique method names' },
      ),
    /** Total execution time for all detection methods */
    totalExecutionTime: z
      .number()
      .min(0, 'Total execution time cannot be negative')
      .max(5000, 'Total execution time seems unreasonably high (>5000ms)')
      .refine(
        time => {
          return Number.isFinite(time) && time < Number.MAX_SAFE_INTEGER;
        },
        { message: 'Total execution time must be a finite number' },
      ),
    /** Timestamp when detection process started */
    detectionStartTime: z
      .number()
      .int('Detection start time must be an integer timestamp')
      .min(0, 'Detection start time cannot be negative'),
    /** Timestamp when detection process ended */
    detectionEndTime: z
      .number()
      .int('Detection end time must be an integer timestamp')
      .min(0, 'Detection end time cannot be negative'),
    /** Optional performance metrics */
    performanceMetrics: z
      .record(z.string(), z.number())
      .optional()
      .refine(
        metrics => {
          if (!metrics) return true;
          // Limit number of performance metrics
          const keys = Object.keys(metrics);
          return keys.length <= 20;
        },
        { message: 'Too many performance metrics (maximum 20 allowed)' },
      ),
  })
  .strict()
  .refine(
    data => {
      // Detection end time must be after start time
      return data.detectionEndTime >= data.detectionStartTime;
    },
    {
      message: 'Detection end time must be after or equal to start time',
      path: ['detectionEndTime'],
    },
  )
  .refine(
    data => {
      // Total execution time should roughly match the time span
      const actualDuration = data.detectionEndTime - data.detectionStartTime;
      // Allow for some measurement variance (up to 100ms difference)
      return Math.abs(data.totalExecutionTime - actualDuration) <= 100;
    },
    {
      message: 'Total execution time should roughly match the detection time span',
      path: ['totalExecutionTime'],
    },
  )
  .refine(
    data => {
      // Sum of individual method execution times should not exceed total
      const sumMethodTimes = data.methodResults.reduce(
        (sum, method) => sum + method.executionTime,
        0,
      );
      return sumMethodTimes <= data.totalExecutionTime + 1; // Allow 1ms variance
    },
    {
      message: 'Sum of individual method execution times cannot exceed total execution time',
      path: ['methodResults'],
    },
  )
  .refine(
    data => {
      // Overall result timestamp should be within the detection time window
      const resultTime = data.overallResult.timestamp;
      return (
        resultTime >= data.detectionStartTime && resultTime <= data.detectionEndTime + 1000 // Allow 1 second variance
      );
    },
    {
      message: 'Overall result timestamp should be within detection time window',
      path: ['overallResult'],
    },
  );
