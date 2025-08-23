import type { MigrationExecutionError } from "./MigrationExecutionError.js";

/**
 * Result of running the complete migration process.
 * Contains summary information about migrations executed and any errors encountered.
 */
export interface MigrationExecutionResult {
  /**
   * Whether the migration process completed successfully without errors.
   */
  success: boolean;

  /**
   * Number of migrations that were successfully executed during this run.
   */
  migrationsRun: number;

  /**
   * Current database version after migration execution (highest migration order).
   */
  currentVersion: number;

  /**
   * Array of errors encountered during migration execution.
   * Only present if success is false or warnings occurred.
   */
  errors?: MigrationExecutionError[];
}
