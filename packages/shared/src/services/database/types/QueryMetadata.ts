/**
 * Metadata information for query operations.
 * Provides additional context about query execution.
 */
export interface QueryMetadata {
  /**
   * Names of the columns returned by the query.
   * Useful for dynamic query result handling.
   */
  columns?: string[];

  /**
   * Execution time in milliseconds (if available).
   * Platform-specific - may not be available on all implementations.
   */
  executionTime?: number;

  /**
   * Number of rows examined during query execution (if available).
   * Useful for performance analysis.
   */
  rowsExamined?: number;
}
