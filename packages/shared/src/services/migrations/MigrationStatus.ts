/**
 * Enumeration of possible migration execution statuses.
 * Used for tracking and reporting migration states.
 */
export enum MigrationStatus {
  /**
   * Migration has not been applied yet and is ready for execution.
   */
  PENDING = "pending",

  /**
   * Migration is currently being executed.
   */
  RUNNING = "running",

  /**
   * Migration has been successfully applied.
   */
  APPLIED = "applied",

  /**
   * Migration execution failed.
   */
  FAILED = "failed",

  /**
   * Migration was skipped due to conditions or dependencies.
   */
  SKIPPED = "skipped",
}
