/**
 * Platform Performance Benchmark Interface
 *
 * Benchmarking data for platform detection performance over time.
 * Tracks performance trends and identifies degradation.
 */

import { PlatformPerformanceMetrics } from './PlatformPerformanceMetrics';

/**
 * Benchmark data for platform detection performance
 */
export interface PlatformPerformanceBenchmark {
  /** Average cached detection time over sample period */
  averageCachedTimeMs: number;
  /** Average uncached detection time over sample period */
  averageUncachedTimeMs: number;
  /** 95th percentile cached detection time */
  p95CachedTimeMs: number;
  /** 95th percentile uncached detection time */
  p95UncachedTimeMs: number;
  /** Number of detections performed */
  totalDetections: number;
  /** Number of cached vs uncached detections */
  cacheHitRate: number;
  /** Performance trend (improving, stable, degrading) */
  trend: 'improving' | 'stable' | 'degrading';
  /** Recent performance metrics samples */
  recentSamples: PlatformPerformanceMetrics[];
  /** Time window for this benchmark in milliseconds */
  timeWindowMs: number;
  /** When this benchmark was last updated */
  lastUpdated: number;
  /** Number of performance threshold violations */
  thresholdViolations: number;
  /** Peak performance achieved */
  bestPerformanceMs: number;
  /** Worst performance recorded */
  worstPerformanceMs: number;
}
