import type { PlatformCapability, CapabilityDetectionResult } from '../../../../types/platform';
import type { ValidationResult } from '../validation/ValidationResult';
import type { FallbackExecutionResult } from '../fallback/FallbackExecutionResult';

/**
 * Unified result of validation and fallback pipeline execution
 *
 * Combines validation results, fallback execution results, and orchestration
 * metadata to provide a comprehensive view of capability processing. Includes
 * performance metrics to ensure sub-2ms validation and sub-5ms fallback requirements.
 *
 * @example
 * ```typescript
 * const result: ValidationFallbackResult = {
 *   capability: secureStorageCapability,
 *   detectionResult: { available: false, ... },
 *   validationResult: { status: 'FAILED_CONTINUE', ... },
 *   fallbackResult: { success: true, ... },
 *   success: true,
 *   message: 'Fallback applied successfully',
 *   combinedRecommendations: ['Use localStorage as alternative'],
 *   totalExecutionTimeMs: 3.2,
 *   performanceMetrics: { validationTimeMs: 1.1, fallbackTimeMs: 2.1 }
 * };
 * ```
 */
export interface ValidationFallbackResult {
  /** The capability that was processed */
  capability: PlatformCapability;

  /** Original detection result that triggered processing */
  detectionResult: CapabilityDetectionResult;

  /** Validation pipeline result (if validation was enabled) */
  validationResult?: ValidationResult;

  /** Fallback execution result (if fallback was triggered) */
  fallbackResult?: FallbackExecutionResult;

  /** Overall success of the validation and fallback pipeline */
  success: boolean;

  /** Summary message describing the processing outcome */
  message: string;

  /** Combined recommendations from validation and fallback systems */
  combinedRecommendations: string[];

  /** Total execution time for the entire pipeline in milliseconds */
  totalExecutionTimeMs: number;

  /** Memory usage for the pipeline execution in bytes */
  memoryUsageBytes: number;

  /** Detailed performance metrics for pipeline components */
  performanceMetrics: {
    /** Time spent in validation pipeline */
    validationTimeMs: number;

    /** Time spent in fallback execution */
    fallbackTimeMs: number;

    /** Time spent in orchestration overhead */
    orchestrationOverheadMs: number;

    /** Memory usage during pipeline execution */
    memoryUsageBytes: number;

    /** Whether performance targets were met */
    metPerformanceTargets: {
      /** Whether validation completed within target time */
      validationTarget: boolean;

      /** Whether fallback completed within target time */
      fallbackTarget: boolean;
    };
  };

  /** Timestamp when processing completed */
  timestamp: number;

  /** Errors that occurred during processing (optional) */
  errors?: Error[];

  /** Additional metadata from processing (optional) */
  metadata?: Record<string, unknown>;
}
