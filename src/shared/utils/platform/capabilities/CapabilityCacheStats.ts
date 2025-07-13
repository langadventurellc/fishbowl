/**
 * Capability Cache Statistics Interface
 *
 * Statistics for cache performance analysis and monitoring.
 * Provides comprehensive metrics for cache hit rates, memory usage, and access patterns.
 */

/**
 * Statistics for cache performance analysis
 */
export interface CapabilityCacheStats {
  /** Total number of cached entries */
  totalEntries: number;

  /** Total cache hits */
  hits: number;

  /** Total cache misses */
  misses: number;

  /** Cache hit rate (0-1) */
  hitRate: number;

  /** Total memory usage in bytes */
  memoryUsageBytes: number;

  /** Memory usage as percentage of limit */
  memoryUsagePercent: number;

  /** Average access count per entry */
  averageAccessCount: number;

  /** Age of oldest entry in ms */
  oldestEntryAge?: number;

  /** Age of newest entry in ms */
  newestEntryAge?: number;

  /** Number of evicted entries */
  evictedEntries: number;

  /** Cache generations (for invalidation tracking) */
  currentGeneration: number;
}
