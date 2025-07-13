/**
 * Enumeration of validation statuses for platform capability detection.
 *
 * Simplified validation status values used in enhanced capability detection
 * results to indicate the overall validation outcome during detection.
 *
 * @example
 * ```typescript
 * import { ValidationStatus } from './ValidationStatus';
 *
 * const result = {
 *   validationStatus: ValidationStatus.PASSED,
 *   // ... other result properties
 * };
 * ```
 *
 * @see {@link EnhancedCapabilityDetectionResult} for usage in detection results
 */
export enum ValidationStatus {
  /**
   * Validation completed successfully with no issues.
   * All validation rules passed and the capability detection is valid.
   */
  PASSED = 'PASSED',

  /**
   * Validation failed due to validation rule failures or errors.
   * The capability detection result may not be reliable.
   */
  FAILED = 'FAILED',

  /**
   * Validation completed with warnings but no critical failures.
   * The capability detection result is usable but may have minor issues.
   */
  WARNING = 'WARNING',

  /**
   * Validation was skipped due to configuration or environmental factors.
   * No validation was performed on the capability detection result.
   */
  SKIPPED = 'SKIPPED',
}
