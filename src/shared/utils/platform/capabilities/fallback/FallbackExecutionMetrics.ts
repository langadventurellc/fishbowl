/**
 * Execution metrics for fallback strategy execution.
 * Tracks performance and success rates for monitoring.
 */

export interface FallbackExecutionMetrics {
  /** Total execution time in milliseconds */
  totalExecutionTimeMs: number;

  /** Number of strategies attempted */
  strategiesAttempted: number;

  /** Number of strategies that completed successfully */
  strategiesSucceeded: number;

  /** Number of strategies that failed */
  strategiesFailed: number;

  /** Number of strategies that timed out */
  strategiesTimedOut: number;

  /** Whether any strategy provided a successful result */
  hasSuccessfulResult: boolean;

  /** Memory usage during execution in bytes */
  memoryUsageBytes?: number;

  /** Individual strategy execution times */
  strategyExecutionTimes: Record<string, number>;

  /** Errors encountered during execution */
  errors: Error[];
}
