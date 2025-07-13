/**
 * Capability Cache Configuration Interface
 *
 * Configuration options for capability detection result caching.
 * Provides fine-grained control over cache behavior and performance.
 */

/**
 * Configuration for capability detection result caching
 *
 * Controls cache behavior, memory management, and performance
 * characteristics for capability detection operations.
 */
export interface CapabilityCacheConfig {
  /** Maximum cache size in number of entries */
  maxEntries: number;

  /** Cache TTL in milliseconds */
  ttlMs: number;

  /** Maximum memory usage in bytes (soft limit) */
  maxMemoryBytes: number;

  /** Whether to enable cache statistics tracking */
  enableStatistics: boolean;

  /** Whether to enable debug logging for cache operations */
  enableDebugLogging: boolean;

  /** Cache eviction strategy */
  evictionStrategy: 'lru' | 'lfu' | 'ttl' | 'memory-based';

  /** Whether to enable cache preloading for common capabilities */
  enablePreloading: boolean;

  /** List of capability IDs to preload on cache initialization */
  preloadCapabilities: string[];

  /** Whether to enable cache persistence (for future implementation) */
  enablePersistence: boolean;

  /** Whether to validate cache entries on retrieval */
  validateOnRetrieval: boolean;

  /** Whether to compress cache entries to save memory */
  enableCompression: boolean;

  /** Cache performance monitoring configuration */
  performanceMonitoring: {
    /** Track hit rate over this time window (ms) */
    hitRateWindowMs: number;

    /** Track access patterns */
    trackAccessPatterns: boolean;

    /** Track memory usage over time */
    trackMemoryUsage: boolean;

    /** Warn when hit rate falls below this threshold */
    lowHitRateThreshold: number;

    /** Warn when memory usage exceeds this threshold */
    highMemoryThreshold: number;
  };

  /** Cache maintenance configuration */
  maintenance: {
    /** How often to run cache cleanup (ms) */
    cleanupIntervalMs: number;

    /** Whether to enable automatic cleanup */
    enableAutoCleanup: boolean;

    /** Whether to compact cache periodically */
    enableCompaction: boolean;

    /** Compact when memory usage exceeds this ratio */
    compactionThreshold: number;
  };
}
