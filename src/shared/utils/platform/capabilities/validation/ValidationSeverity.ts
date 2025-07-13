/**
 * Severity level for validation rule violations
 */
export enum ValidationSeverity {
  /** Information only - does not affect detection */
  INFO = 'INFO',
  /** Warning - detection continues but result may be unreliable */
  WARNING = 'WARNING',
  /** Error - detection should fail */
  ERROR = 'ERROR',
  /** Critical - detection must stop immediately */
  CRITICAL = 'CRITICAL',
}
