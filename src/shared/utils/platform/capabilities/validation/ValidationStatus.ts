/**
 * Overall validation status for the pipeline
 */
export enum ValidationStatus {
  /** All validation rules passed */
  PASSED = 'PASSED',
  /** Some rules failed but detection can continue */
  FAILED_CONTINUE = 'FAILED_CONTINUE',
  /** Critical failures - detection must stop */
  FAILED_STOP = 'FAILED_STOP',
  /** Warnings present but overall validation passed */
  PASSED_WITH_WARNINGS = 'PASSED_WITH_WARNINGS',
}
