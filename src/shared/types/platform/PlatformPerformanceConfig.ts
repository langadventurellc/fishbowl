/**
 * Platform Performance Configuration Interface
 *
 * Configuration options for platform detection performance monitoring.
 * Allows customization of performance tracking and thresholds.
 */

/**
 * Configuration for platform performance monitoring
 */
export interface PlatformPerformanceConfig {
  /** Whether to enable performance monitoring */
  enabled: boolean;
  /** Maximum acceptable cached detection time in milliseconds */
  cachedThresholdMs: number;
  /** Maximum acceptable uncached detection time in milliseconds */
  uncachedThresholdMs: number;
  /** Whether to collect memory usage metrics */
  collectMemoryMetrics: boolean;
  /** Whether to use performance.mark API for detailed timing */
  usePerformanceMarks: boolean;
  /** Sample rate for performance collection (0-1) */
  sampleRate: number;
  /** Whether to log performance warnings */
  logWarnings: boolean;
  /** Maximum number of performance records to keep */
  maxRecords: number;
  /** Whether to report performance metrics to analytics */
  reportMetrics: boolean;
}
