/**
 * Performance thresholds for store operations.
 */
export interface PerformanceThresholds {
  slowOperationMs: number;
  bulkOperationMs: number;
  stateSizeWarningMB: number;
  stateSizeLimitMB: number;
  memoryLeakThresholdMB: number;
  highFrequencyCallsPerSecond: number;
}
