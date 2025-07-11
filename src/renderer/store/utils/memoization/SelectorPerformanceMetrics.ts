/**
 * Performance metrics for a memoized selector.
 */
export interface SelectorPerformanceMetrics {
  /** Total number of calls */
  totalCalls: number;
  /** Number of cache hits */
  cacheHits: number;
  /** Number of cache misses */
  cacheMisses: number;
  /** Average execution time in milliseconds */
  averageExecutionTime: number;
  /** Last execution time in milliseconds */
  lastExecutionTime: number;
  /** Maximum execution time in milliseconds */
  maxExecutionTime: number;
  /** Minimum execution time in milliseconds */
  minExecutionTime: number;
}
