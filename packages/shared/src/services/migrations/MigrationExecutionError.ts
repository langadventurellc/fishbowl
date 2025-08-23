/**
 * Details about a migration execution error.
 */
export interface MigrationExecutionError {
  /**
   * Migration order number that failed.
   */
  order: number;

  /**
   * Migration filename that failed.
   */
  filename: string;

  /**
   * Human-readable error message.
   */
  error: string;
}
