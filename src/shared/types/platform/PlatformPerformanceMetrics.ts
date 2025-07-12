/**
 * Platform Performance Metrics Interface
 *
 * Tracks performance metrics for platform detection operations.
 * Supports the requirement for sub-1ms cached detection performance.
 */

/**
 * Performance metrics for platform detection operations
 */
export interface PlatformPerformanceMetrics {
  /** Total time for platform detection in milliseconds */
  totalDetectionTimeMs: number;
  /** Time to check cache in milliseconds */
  cacheCheckTimeMs: number;
  /** Time for actual platform detection (cache miss) in milliseconds */
  detectionTimeMs?: number;
  /** Number of detection methods executed */
  methodsExecuted: number;
  /** Whether result was served from cache */
  servedFromCache: boolean;
  /** Memory usage during detection in bytes */
  memoryUsageBytes?: number;
  /** Peak memory usage during detection in bytes */
  peakMemoryUsageBytes?: number;
  /** Number of global object checks performed */
  globalObjectChecks: number;
  /** Timestamp when measurement started */
  startTimestamp: number;
  /** Timestamp when measurement completed */
  endTimestamp: number;
  /** Performance mark identifiers used */
  performanceMarks?: string[];
  /** Whether performance target was met (<1ms for cached) */
  targetMet: boolean;
}
