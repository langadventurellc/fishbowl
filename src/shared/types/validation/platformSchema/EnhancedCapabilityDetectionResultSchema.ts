import { z } from 'zod';
import { ValidationStatus } from '../../platform/ValidationStatus';
import { PlatformCapabilityIdSchema } from './PlatformCapabilityIdSchema';
import { TimestampSchema } from './TimestampSchema';

/**
 * Validation schema for fallback application result with comprehensive tracking.
 *
 * Validates fallback strategy execution results including success tracking,
 * performance metrics, and applied recommendations with proper bounds checking.
 */
const FallbackApplicationResultSchema = z
  .object({
    success: z
      .boolean()
      .describe('Whether at least one fallback strategy was successfully applied'),

    appliedStrategies: z
      .array(z.string().min(1).max(50))
      .max(10, 'Cannot have more than 10 applied strategies')
      .describe('List of fallback strategy names that were successfully applied'),

    failedStrategies: z
      .array(z.string().min(1).max(50))
      .max(10, 'Cannot have more than 10 failed strategies')
      .describe('List of fallback strategy names that failed during execution'),

    finalRecommendation: z
      .string()
      .min(1, 'Final recommendation cannot be empty')
      .max(200, 'Final recommendation cannot exceed 200 characters')
      .describe('Final recommendation from the most successful fallback strategy'),

    alternativeCapabilities: z
      .array(PlatformCapabilityIdSchema)
      .max(20, 'Cannot have more than 20 alternative capabilities')
      .optional()
      .describe('Alternative capability IDs that could provide similar functionality'),

    degradedFeatures: z
      .record(z.string(), z.unknown())
      .optional()
      .describe('Modified configuration or feature set for graceful degradation'),

    executionTimeMs: z
      .number()
      .min(0, 'Execution time cannot be negative')
      .max(30000, 'Execution time cannot exceed 30 seconds')
      .describe('Total execution time for all fallback strategy attempts'),

    attemptsCount: z
      .number()
      .int()
      .min(1, 'Must have at least 1 attempt')
      .max(10, 'Cannot exceed 10 attempts')
      .describe('Total number of fallback strategy attempts made'),

    cacheUsed: z.boolean().describe('Whether cached fallback results were used'),

    resultCacheable: z.boolean().describe('Whether this fallback result should be cached'),

    memoryUsageBytes: z
      .number()
      .int()
      .min(0, 'Memory usage cannot be negative')
      .max(10485760, 'Memory usage cannot exceed 10MB')
      .optional()
      .describe('Memory usage during fallback execution in bytes'),

    errors: z
      .record(z.string(), z.array(z.string()))
      .optional()
      .describe('Errors encountered during fallback strategy execution'),

    warnings: z
      .array(z.string().max(500))
      .max(50, 'Cannot have more than 50 warnings')
      .optional()
      .describe('Warnings generated during fallback strategy execution'),

    confidence: z
      .number()
      .min(0.0, 'Confidence cannot be less than 0.0')
      .max(1.0, 'Confidence cannot be greater than 1.0')
      .optional()
      .describe('Confidence level in the fallback solution'),

    meetsMinimumRequirements: z
      .boolean()
      .describe('Whether the fallback result meets minimum functionality requirements'),

    timestamp: z
      .number()
      .int()
      .min(0, 'Timestamp cannot be negative')
      .describe('Timestamp when the fallback application was completed'),

    metadata: z
      .record(z.string(), z.unknown())
      .optional()
      .describe('Custom metadata from fallback strategies'),
  })
  .strict();

/**
 * Zod schema for enhanced capability detection result with validation status and applied fallbacks.
 *
 * Validates comprehensive capability detection results that include validation
 * tracking, fallback strategy application, and performance metrics with proper
 * bounds checking and logical consistency validation.
 *
 * @example
 * ```typescript
 * import { EnhancedCapabilityDetectionResultSchema } from './EnhancedCapabilityDetectionResultSchema';
 *
 * const enhancedResult = {
 *   // Standard detection result properties
 *   capability: secureStorageCapability,
 *   available: false,
 *   detectionTimeMs: 25,
 *   detectionMethod: 'electron-keytar-check',
 *   evidence: ['window.electronAPI not available'],
 *   requiredPermissions: ['secure-storage'],
 *   permissionsGranted: false,
 *   timestamp: Date.now(),
 *
 *   // Enhanced validation and fallback properties
 *   validationStatus: 'PASSED',
 *   validationExecuted: true,
 *   validationTimeMs: 5,
 *   fallbackApplied: true,
 *   fallbackResults: {
 *     success: true,
 *     appliedStrategies: ['alternative'],
 *     failedStrategies: [],
 *     finalRecommendation: 'USE_LOCAL_STORAGE',
 *     executionTimeMs: 120,
 *     attemptsCount: 1,
 *     cacheUsed: false,
 *     resultCacheable: true,
 *     meetsMinimumRequirements: true,
 *     timestamp: Date.now()
 *   },
 *   totalProcessingTimeMs: 150,
 *   recommendationApplied: true,
 *   confidenceLevel: 0.85,
 *   cacheUsed: false,
 *   cacheable: true
 * };
 *
 * const result = EnhancedCapabilityDetectionResultSchema.safeParse(enhancedResult);
 * if (result.success) {
 *   // Enhanced result is valid
 * }
 * ```
 *
 * @see {@link EnhancedCapabilityDetectionResult} for the TypeScript interface
 */
export const EnhancedCapabilityDetectionResultSchema = z
  .object({
    // Base capability detection result properties
    capability: z.record(z.string(), z.unknown()).describe('The capability that was tested'),

    available: z.boolean().describe('Whether the capability is available'),

    detectionTimeMs: z
      .number()
      .min(0, 'Detection time cannot be negative')
      .max(10000, 'Detection time cannot exceed 10 seconds')
      .describe('Time taken to detect capability in milliseconds'),

    detectionMethod: z
      .string()
      .min(1, 'Detection method cannot be empty')
      .max(100, 'Detection method cannot exceed 100 characters')
      .describe('Method used to detect the capability'),

    evidence: z
      .array(z.string().max(500))
      .max(50, 'Cannot have more than 50 evidence items')
      .describe('Evidence gathered during detection'),

    warnings: z
      .array(z.string().max(500))
      .max(50, 'Cannot have more than 50 warnings')
      .optional()
      .describe('Any warnings about the capability'),

    requiredPermissions: z
      .array(z.string().min(1).max(100))
      .max(20, 'Cannot require more than 20 permissions')
      .describe('Permissions required for this capability'),

    permissionsGranted: z.boolean().describe('Whether permissions are currently granted'),

    fallbackOptions: z
      .array(z.string().max(200))
      .max(10, 'Cannot have more than 10 fallback options')
      .optional()
      .describe('Fallback options if capability is not available'),

    timestamp: TimestampSchema,

    // Enhanced validation and fallback properties
    validationStatus: z
      .nativeEnum(ValidationStatus)
      .describe('Overall validation status for the capability detection'),

    validationExecuted: z
      .boolean()
      .describe('Whether validation was actually executed during detection'),

    validationTimeMs: z
      .number()
      .min(0, 'Validation time cannot be negative')
      .max(10000, 'Validation time cannot exceed 10 seconds')
      .describe('Time spent on validation in milliseconds'),

    validationErrors: z
      .array(z.string().max(500))
      .max(50, 'Cannot have more than 50 validation errors')
      .optional()
      .describe('Detailed validation error messages if validation failed'),

    validationWarnings: z
      .array(z.string().max(500))
      .max(50, 'Cannot have more than 50 validation warnings')
      .optional()
      .describe('Validation warning messages for non-critical issues'),

    fallbackApplied: z
      .boolean()
      .describe('Whether fallback strategies were applied during detection'),

    fallbackResults: FallbackApplicationResultSchema.optional().describe(
      'Detailed results from fallback strategy application',
    ),

    totalProcessingTimeMs: z
      .number()
      .min(0, 'Total processing time cannot be negative')
      .max(60000, 'Total processing time cannot exceed 60 seconds')
      .describe('Total time spent on the entire enhanced detection process'),

    recommendationApplied: z
      .boolean()
      .describe('Whether a fallback recommendation was ultimately applied'),

    finalCapability: z
      .string()
      .min(1)
      .max(100)
      .optional()
      .describe('Final usable capability or alternative after all processing'),

    confidenceLevel: z
      .number()
      .min(0.0, 'Confidence level cannot be less than 0.0')
      .max(1.0, 'Confidence level cannot be greater than 1.0')
      .describe('Confidence level in the final detection result'),

    cacheUsed: z
      .boolean()
      .describe('Whether the enhanced detection result was retrieved from cache'),

    cacheable: z.boolean().describe('Whether this enhanced result should be cached for future use'),

    memoryUsageBytes: z
      .number()
      .int()
      .min(0, 'Memory usage cannot be negative')
      .max(104857600, 'Memory usage cannot exceed 100MB')
      .optional()
      .describe('Total memory usage during enhanced detection in bytes'),

    enhancedMetadata: z
      .record(z.string(), z.unknown())
      .optional()
      .describe('Additional metadata from validation and fallback processing'),
  })
  .strict()
  .refine(result => result.validationExecuted || result.validationTimeMs === 0, {
    message: 'Validation time must be 0 when validation was not executed',
    path: ['validationTimeMs'],
  })
  .refine(result => !result.fallbackApplied || result.fallbackResults !== undefined, {
    message: 'Fallback results must be provided when fallback was applied',
    path: ['fallbackResults'],
  })
  .refine(
    result => {
      const minimumTime = result.detectionTimeMs + result.validationTimeMs;
      return result.totalProcessingTimeMs >= minimumTime;
    },
    {
      message: 'Total processing time must be at least the sum of detection and validation times',
      path: ['totalProcessingTimeMs'],
    },
  )
  .refine(
    result => {
      return (
        result.validationStatus !== ValidationStatus.FAILED ||
        (result.validationErrors && result.validationErrors.length > 0)
      );
    },
    {
      message: 'Validation errors must be provided when validation status is FAILED',
      path: ['validationErrors'],
    },
  )
  .refine(
    result => {
      return (
        !(result.validationStatus === ValidationStatus.FAILED && result.confidenceLevel > 0.7) &&
        !(result.fallbackApplied && result.confidenceLevel > 0.9)
      );
    },
    {
      message: 'Confidence level should be reduced when validation fails or fallbacks are applied',
      path: ['confidenceLevel'],
    },
  )
  .describe(
    'Enhanced capability detection result with validation status and applied fallbacks validation',
  );
