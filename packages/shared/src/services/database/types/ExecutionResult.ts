import { DatabaseResult } from "./DatabaseResult";

/**
 * Result type for data modification operations (INSERT, UPDATE, DELETE).
 * Extends DatabaseResult with success/error information.
 *
 * @example
 * ```typescript
 * const result: ExecutionResult = await db.execute(
 *   'INSERT INTO users (name, email) VALUES (?, ?)',
 *   ['John Doe', 'john@example.com']
 * );
 *
 * if (result.success) {
 *   console.log(`Inserted user with ID: ${result.lastInsertRowid}`);
 *   console.log(`Rows affected: ${result.changes}`);
 * } else {
 *   console.error(`Database error: ${result.error}`);
 * }
 * ```
 */
export interface ExecutionResult extends DatabaseResult {
  /**
   * Indicates whether the operation completed successfully.
   * true: Operation succeeded without errors
   * false: Operation failed, check `error` property for details
   */
  success: boolean;

  /**
   * Human-readable error message if the operation failed.
   * Only populated when `success` is false.
   * Should provide enough context for debugging and user feedback.
   */
  error?: string;

  /**
   * Optional error code for programmatic error handling.
   * Platform-specific error codes for more detailed error classification.
   */
  errorCode?: string | number;
}
