import { CapabilityDetectionResult } from './CapabilityDetectionResult';
import { ValidationStatus } from './ValidationStatus';
import { FallbackApplicationResult } from './FallbackApplicationResult';

/**
 * Enhanced capability detection result with validation status and applied fallbacks.
 *
 * Extends the standard capability detection result to include comprehensive
 * validation tracking and fallback strategy application results. This provides
 * a complete picture of the detection process including any validation issues
 * and fallback strategies that were applied.
 *
 * @example
 * ```typescript
 * const enhancedResult: EnhancedCapabilityDetectionResult = {
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
 *   validationStatus: ValidationStatus.PASSED,
 *   validationExecuted: true,
 *   validationTimeMs: 5,
 *   fallbackApplied: true,
 *   fallbackResults: {
 *     success: true,
 *     appliedStrategies: ['alternative'],
 *     finalRecommendation: 'USE_LOCAL_STORAGE',
 *     executionTimeMs: 120,
 *     // ... other fallback result properties
 *   },
 *   totalProcessingTimeMs: 150,
 *   recommendationApplied: true
 * };
 * ```
 *
 * @see {@link CapabilityDetectionResult} for base detection result properties
 * @see {@link ValidationStatus} for validation status values
 * @see {@link FallbackApplicationResult} for fallback execution details
 */
export interface EnhancedCapabilityDetectionResult extends CapabilityDetectionResult {
  /**
   * Overall validation status for the capability detection.
   * Indicates whether validation passed, failed, had warnings, or was skipped.
   */
  validationStatus: ValidationStatus;

  /**
   * Whether validation was actually executed during detection.
   * False if validation was disabled or skipped due to configuration.
   */
  validationExecuted: boolean;

  /**
   * Time spent on validation in milliseconds.
   * Only meaningful when validationExecuted is true.
   *
   * @minimum 0
   */
  validationTimeMs: number;

  /**
   * Detailed validation error messages if validation failed.
   * Contains specific validation rule failures and their descriptions.
   */
  validationErrors?: string[];

  /**
   * Validation warning messages for non-critical issues.
   * Contains warnings that didn't prevent validation success.
   */
  validationWarnings?: string[];

  /**
   * Whether fallback strategies were applied during detection.
   * True if any fallback processing was attempted regardless of success.
   */
  fallbackApplied: boolean;

  /**
   * Detailed results from fallback strategy application.
   * Contains comprehensive information about fallback execution and results.
   */
  fallbackResults?: FallbackApplicationResult;

  /**
   * Total time spent on the entire enhanced detection process.
   * Includes detection, validation, and fallback execution time.
   *
   * @minimum 0
   */
  totalProcessingTimeMs: number;

  /**
   * Whether a fallback recommendation was ultimately applied.
   * True if the detection process resulted in a usable alternative.
   */
  recommendationApplied: boolean;

  /**
   * Final usable capability or alternative after all processing.
   * May differ from the original capability if fallbacks were applied.
   */
  finalCapability?: string;

  /**
   * Confidence level in the final detection result (0.0 to 1.0).
   * Considers detection reliability, validation status, and fallback quality.
   *
   * @minimum 0.0
   * @maximum 1.0
   */
  confidenceLevel: number;

  /**
   * Whether the enhanced detection result was retrieved from cache.
   * True if cached results were used instead of fresh detection.
   */
  cacheUsed: boolean;

  /**
   * Whether this enhanced result should be cached for future use.
   * Based on confidence level, processing time, and result stability.
   */
  cacheable: boolean;

  /**
   * Total memory usage during enhanced detection in bytes.
   * Includes memory used by detection, validation, and fallback processing.
   */
  memoryUsageBytes?: number;

  /**
   * Additional metadata from validation and fallback processing.
   * Contains strategy-specific information and debugging data.
   */
  enhancedMetadata?: Record<string, unknown>;
}
