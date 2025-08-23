/**
 * Discriminated union type representing the result of a migration execution.
 * Provides type-safe handling of success/failure scenarios.
 *
 * @example
 * ```typescript
 * // Success case
 * const successResult: MigrationResult = {
 *   success: true,
 *   filename: "001_create_users_table.sql",
 *   executionTime: 1250
 * };
 *
 * // Failure case
 * const failureResult: MigrationResult = {
 *   success: false,
 *   filename: "002_invalid_syntax.sql",
 *   error: "SQL syntax error near line 5"
 * };
 *
 * // Type-safe usage
 * if (result.success) {
 *   console.log(`Migration completed in ${result.executionTime}ms`);
 * } else {
 *   console.error(`Migration failed: ${result.error}`);
 * }
 * ```
 */
export type MigrationResult =
  | {
      /**
       * Indicates successful migration execution.
       */
      success: true;

      /**
       * The migration filename that was successfully executed.
       */
      filename: string;

      /**
       * Time in milliseconds taken to execute the migration.
       * Useful for performance monitoring.
       */
      executionTime: number;
    }
  | {
      /**
       * Indicates failed migration execution.
       */
      success: false;

      /**
       * The migration filename that failed to execute.
       */
      filename: string;

      /**
       * Human-readable error message describing the failure.
       * Should not contain sensitive information.
       */
      error: string;
    };
