/**
 * Platform Performance Benchmark Interface
 *
 * Benchmarking data for platform detection performance over time.
 * Tracks performance trends and identifies degradation.
 */

import { PlatformPerformanceMetrics } from './PlatformPerformanceMetrics';

/**
 * Benchmark data for platform detection performance
 *
 * This interface captures comprehensive performance metrics for platform
 * detection operations over time. It enables performance monitoring,
 * trend analysis, and early detection of performance degradation.
 *
 * **Performance Requirements:**
 * - Cached detection: < 1ms (sub-millisecond requirement)
 * - Uncached detection: < 50ms (acceptable first-time cost)
 * - Cache hit rate: > 95% (efficiency target)
 * - Memory overhead: < 1KB (minimal footprint)
 *
 * @example
 * ```typescript
 * const benchmark: PlatformPerformanceBenchmark = {
 *   averageCachedTimeMs: 0.3,      // Well under 1ms requirement
 *   averageUncachedTimeMs: 12.5,   // Acceptable first-time cost
 *   p95CachedTimeMs: 0.8,          // 95% of cached calls under 1ms
 *   p95UncachedTimeMs: 35.2,       // 95% of uncached calls under 50ms
 *   cacheHitRate: 0.97,            // 97% cache hit rate
 *   trend: 'stable',               // Performance is consistent
 *   thresholdViolations: 2,        // Only 2 violations in time window
 *   bestPerformanceMs: 0.1,        // Fastest recorded detection
 *   worstPerformanceMs: 45.3       // Slowest recorded detection
 * };
 * ```
 */
export interface PlatformPerformanceBenchmark {
  /**
   * Average cached detection time over sample period in milliseconds.
   *
   * **Target: < 1ms** (sub-millisecond requirement for cached operations)
   *
   * This metric represents the mean time for platform detection when
   * results are served from cache. Should consistently be well under 1ms
   * to meet the system's performance requirements.
   */
  averageCachedTimeMs: number;
  /**
   * Average uncached detection time over sample period in milliseconds.
   *
   * **Target: < 50ms** (acceptable first-time detection cost)
   *
   * This metric represents the mean time for initial platform detection
   * when no cached result is available. Includes API checking, validation,
   * and cache population time.
   */
  averageUncachedTimeMs: number;
  /**
   * 95th percentile cached detection time in milliseconds.
   *
   * **Calculation:** Sort all cached detection times, take value at 95% position.
   * **Target: < 1ms** for 95% of cached operations.
   *
   * This metric shows that 95% of cached detections complete within this time.
   * More reliable than average for performance guarantees as it accounts for
   * occasional slower operations (GC pauses, system load, etc.).
   */
  p95CachedTimeMs: number;
  /**
   * 95th percentile uncached detection time in milliseconds.
   *
   * **Calculation:** Sort all uncached detection times, take value at 95% position.
   * **Target: < 50ms** for 95% of uncached operations.
   *
   * This metric ensures that even in worst-case scenarios (excluding the
   * slowest 5% of operations), platform detection completes within acceptable
   * time limits for user experience.
   */
  p95UncachedTimeMs: number;
  /** Number of detections performed */
  totalDetections: number;
  /**
   * Cache hit rate as a decimal between 0 and 1.
   *
   * **Calculation:** cacheHits / (cacheHits + cacheMisses)
   * **Target: > 0.95** (95% cache hit rate for efficiency)
   *
   * High cache hit rates indicate effective caching and efficient
   * platform detection. Low hit rates may suggest cache expiration
   * issues, frequent cache invalidation, or diverse detection patterns.
   *
   * @example
   * ```typescript
   * cacheHitRate: 0.97  // 97% of detections served from cache
   * ```
   */
  cacheHitRate: number;
  /**
   * Performance trend analysis based on recent samples.
   *
   * **Trend Analysis Algorithm:**
   * - `improving`: Recent performance is consistently better than historical average
   * - `stable`: Recent performance is within ±10% of historical average
   * - `degrading`: Recent performance is consistently worse than historical average
   *
   * **Calculation Method:**
   * 1. Compare recent 20% of samples to older 80% of samples
   * 2. Use statistical significance testing (t-test) for trend detection
   * 3. Require consistent direction over multiple samples to avoid noise
   *
   * **Actions by Trend:**
   * - `improving`: Continue current optimizations
   * - `stable`: Monitor for changes, maintain current approach
   * - `degrading`: Investigate causes, consider cache tuning or algorithm optimization
   */
  trend: 'improving' | 'stable' | 'degrading';
  /** Recent performance metrics samples */
  recentSamples: PlatformPerformanceMetrics[];
  /** Time window for this benchmark in milliseconds */
  timeWindowMs: number;
  /** When this benchmark was last updated */
  lastUpdated: number;
  /**
   * Number of performance threshold violations in the current time window.
   *
   * **Violation Definitions:**
   * - Cached detection > 1ms
   * - Uncached detection > 50ms
   * - Cache hit rate < 90% in any 5-minute period
   * - Memory usage > 1KB for platform detection cache
   *
   * **Monitoring Guidelines:**
   * - 0 violations: Excellent performance
   * - 1-5 violations: Acceptable, monitor for patterns
   * - 6-10 violations: Investigate optimization opportunities
   * - >10 violations: Performance degradation, requires attention
   */
  thresholdViolations: number;
  /**
   * Peak performance achieved (fastest detection time) in milliseconds.
   *
   * Represents the absolute fastest platform detection recorded in this
   * time window. Useful for understanding the theoretical minimum detection
   * time and evaluating optimization potential.
   *
   * **Typical Values:**
   * - Cached: 0.1-0.5ms (fastest possible cache lookup)
   * - Uncached: 5-15ms (optimized first-time detection)
   */
  bestPerformanceMs: number;
  /**
   * Worst performance recorded (slowest detection time) in milliseconds.
   *
   * Represents the slowest platform detection in this time window.
   * Useful for identifying performance outliers and understanding
   * worst-case scenarios that may impact user experience.
   *
   * **Investigation Triggers:**
   * - Cached > 5ms: Potential cache corruption or system issues
   * - Uncached > 100ms: Network issues, API timeouts, or system overload
   * - Consistently high: Algorithm inefficiency or resource constraints
   */
  worstPerformanceMs: number;
}
