/**
 * Configuration options for database query operations.
 * Supports pagination, timeouts, and debugging features.
 */
export interface QueryOptions {
  /**
   * Maximum time in milliseconds to wait for query completion.
   * @default 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Maximum number of rows to return in a single query result.
   * Used for pagination and memory management.
   * @default undefined (no limit)
   */
  limit?: number;

  /**
   * Number of rows to skip before starting to return results.
   * Used in conjunction with limit for pagination.
   * @default 0
   */
  offset?: number;

  /**
   * Whether to include query metadata in the result.
   * Metadata includes execution time, row count, and query plan information.
   * @default false
   */
  returnMetadata?: boolean;

  /**
   * Enable debug logging for the query execution.
   * Logs SQL statements, parameters, and execution details.
   * @default false
   */
  debug?: boolean;

  /**
   * Whether to prepare the query statement for multiple executions.
   * Can improve performance when executing the same query multiple times.
   * @default false
   */
  prepare?: boolean;
}
