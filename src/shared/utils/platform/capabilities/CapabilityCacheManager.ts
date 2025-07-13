/**
 * Enhanced Capability Cache Manager
 *
 * Provides sophisticated caching for capability detection results with
 * performance tracking, memory management, and cache statistics.
 */

import { CapabilityDetectionResult } from '../../../types/platform/CapabilityDetectionResult';
import { CapabilityCacheEntry } from './CapabilityCacheEntry';
import { CapabilityCacheConfig } from './CapabilityCacheConfig';
import { CapabilityCacheStats } from './CapabilityCacheStats';

/**
 * Enhanced cache manager for capability detection results
 *
 * Provides sophisticated caching with hit rate tracking, memory management,
 * and performance monitoring following best practices for TypeScript Map caching.
 */
export class CapabilityCacheManager {
  private readonly cache = new Map<string, CapabilityCacheEntry>();
  private readonly config: CapabilityCacheConfig;
  private stats: {
    hits: number;
    misses: number;
    evicted: number;
    generation: number;
  };

  constructor(config: Partial<CapabilityCacheConfig> = {}) {
    this.config = {
      maxEntries: 100,
      ttlMs: 60000, // 1 minute
      maxMemoryBytes: 1024 * 1024, // 1MB
      enableStatistics: true,
      enableDebugLogging: false,
      evictionStrategy: 'lru',
      enablePreloading: false,
      preloadCapabilities: [],
      enablePersistence: false,
      validateOnRetrieval: true,
      enableCompression: false,
      performanceMonitoring: {
        hitRateWindowMs: 300000, // 5 minutes
        trackAccessPatterns: true,
        trackMemoryUsage: true,
        lowHitRateThreshold: 0.7,
        highMemoryThreshold: 0.9,
      },
      maintenance: {
        cleanupIntervalMs: 30000, // 30 seconds
        enableAutoCleanup: true,
        enableCompaction: false,
        compactionThreshold: 0.8,
      },
      ...config,
    };

    this.stats = {
      hits: 0,
      misses: 0,
      evicted: 0,
      generation: 1,
    };

    // Start automatic cleanup if enabled
    if (this.config.maintenance.enableAutoCleanup) {
      this.startAutoCleanup();
    }
  }

  /**
   * Gets a cached capability detection result
   *
   * @param capabilityId - The capability ID to retrieve
   * @returns Cached result or undefined if not found/expired
   */
  get(capabilityId: string): CapabilityDetectionResult | undefined {
    const entry = this.cache.get(capabilityId);

    if (!entry) {
      this.recordMiss();
      this.logDebug(`Cache miss for capability: ${capabilityId}`);
      return undefined;
    }

    // Check if entry has expired
    const now = Date.now();
    const age = now - entry.cachedAt;

    if (age > this.config.ttlMs) {
      this.cache.delete(capabilityId);
      this.recordMiss();
      this.logDebug(`Cache expired for capability: ${capabilityId} (age: ${age}ms)`);
      return undefined;
    }

    // Update access tracking
    entry.lastAccessedAt = now;
    entry.accessCount++;

    this.recordHit();
    this.logDebug(`Cache hit for capability: ${capabilityId} (access count: ${entry.accessCount})`);

    return entry.result;
  }

  /**
   * Stores a capability detection result in cache
   *
   * @param capabilityId - The capability ID
   * @param result - The detection result to cache
   */
  set(capabilityId: string, result: CapabilityDetectionResult): void {
    try {
      // Validate input
      if (!capabilityId || typeof capabilityId !== 'string') {
        this.logDebug('Invalid capability ID provided to cache');
        return;
      }

      if (!result || typeof result !== 'object') {
        this.logDebug('Invalid capability result provided to cache');
        return;
      }

      const now = Date.now();
      const estimatedSize = this.estimateEntrySize(result);

      const entry: CapabilityCacheEntry = {
        result,
        cachedAt: now,
        lastAccessedAt: now,
        accessCount: 0,
        estimatedSizeBytes: estimatedSize,
        generation: this.stats.generation,
        metadata: {
          source: 'capability-detection',
          cacheSource: 'computation',
        },
      };

      // Check if we need to make room
      this.ensureCapacity(estimatedSize);

      // Store the entry
      this.cache.set(capabilityId, entry);

      this.logDebug(`Cached result for capability: ${capabilityId} (size: ${estimatedSize} bytes)`);

      // Check memory usage
      this.checkMemoryUsage();
    } catch (error) {
      this.logDebug(`Failed to cache capability result: ${String(error)}`);
      // Silent failure - caching is an optimization
    }
  }

  /**
   * Removes a capability from cache
   *
   * @param capabilityId - The capability ID to remove
   * @returns True if entry was removed
   */
  delete(capabilityId: string): boolean {
    const deleted = this.cache.delete(capabilityId);
    if (deleted) {
      this.logDebug(`Removed capability from cache: ${capabilityId}`);
    }
    return deleted;
  }

  /**
   * Clears all cached entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.generation++;
    this.logDebug(`Cleared cache (removed ${size} entries)`);
  }

  /**
   * Checks if a capability is cached and valid
   *
   * @param capabilityId - The capability ID to check
   * @returns True if cached and valid
   */
  has(capabilityId: string): boolean {
    const entry = this.cache.get(capabilityId);
    if (!entry) {
      return false;
    }

    const now = Date.now();
    const age = now - entry.cachedAt;

    if (age > this.config.ttlMs) {
      this.cache.delete(capabilityId);
      return false;
    }

    return true;
  }

  /**
   * Gets comprehensive cache statistics
   *
   * @returns Cache performance statistics
   */
  getStats(): CapabilityCacheStats {
    const entries = Array.from(this.cache.values());
    const now = Date.now();

    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    const memoryUsage = entries.reduce((total, entry) => total + entry.estimatedSizeBytes, 0);
    const memoryPercent =
      this.config.maxMemoryBytes > 0 ? memoryUsage / this.config.maxMemoryBytes : 0;

    const accessCounts = entries.map(entry => entry.accessCount);
    const averageAccessCount =
      accessCounts.length > 0
        ? accessCounts.reduce((sum, count) => sum + count, 0) / accessCounts.length
        : 0;

    const ages = entries.map(entry => now - entry.cachedAt);
    const oldestEntryAge = ages.length > 0 ? Math.max(...ages) : undefined;
    const newestEntryAge = ages.length > 0 ? Math.min(...ages) : undefined;

    return {
      totalEntries: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      memoryUsageBytes: memoryUsage,
      memoryUsagePercent: memoryPercent,
      averageAccessCount,
      oldestEntryAge,
      newestEntryAge,
      evictedEntries: this.stats.evicted,
      currentGeneration: this.stats.generation,
    };
  }

  /**
   * Performs cache maintenance and cleanup
   */
  cleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    // Remove expired entries
    for (const [capabilityId, entry] of this.cache.entries()) {
      const age = now - entry.cachedAt;

      if (age > this.config.ttlMs || entry.markedForEviction) {
        this.cache.delete(capabilityId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logDebug(`Cleanup removed ${removedCount} expired entries`);
    }

    // Check if compaction is needed
    if (this.config.maintenance.enableCompaction) {
      this.compactIfNeeded();
    }
  }

  /**
   * Resets cache statistics
   */
  resetStats(): void {
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.evicted = 0;
    this.logDebug('Cache statistics reset');
  }

  /**
   * Estimates memory size of a cache entry
   */
  private estimateEntrySize(result: CapabilityDetectionResult): number {
    try {
      // Rough estimation based on object structure
      let size = 200; // Base object overhead

      // Capability object
      size += JSON.stringify(result.capability).length * 2; // UTF-16 encoding

      // Arrays (evidence, warnings, permissions, fallbackOptions)
      size += result.evidence.reduce((sum, item) => sum + item.length * 2, 0);
      size += (result.warnings ?? []).reduce((sum, item) => sum + item.length * 2, 0);
      size += result.requiredPermissions.reduce((sum, item) => sum + item.length * 2, 0);
      size += (result.fallbackOptions ?? []).reduce((sum, item) => sum + item.length * 2, 0);

      // Strings
      size += result.detectionMethod.length * 2;

      // Numbers and booleans
      size += 64; // timestamp, detectionTimeMs, booleans

      // Cache entry overhead
      size += 100;

      return Math.max(size, 300); // Minimum size
    } catch {
      return 500; // Fallback estimate
    }
  }

  /**
   * Ensures cache has capacity for new entry
   */
  private ensureCapacity(newEntrySize: number): void {
    // Check entry count limit
    if (this.cache.size >= this.config.maxEntries) {
      this.evictLeastUsed();
    }

    // Check memory limit
    const currentMemory = this.getCurrentMemoryUsage();
    if (currentMemory + newEntrySize > this.config.maxMemoryBytes) {
      this.evictToFreeMemory(newEntrySize);
    }
  }

  /**
   * Evicts least recently used entry
   */
  private evictLeastUsed(): void {
    let oldestEntry: [string, CapabilityCacheEntry] | null = null;

    for (const entry of this.cache.entries()) {
      if (!oldestEntry || entry[1].lastAccessedAt < oldestEntry[1].lastAccessedAt) {
        oldestEntry = entry;
      }
    }

    if (oldestEntry) {
      this.cache.delete(oldestEntry[0]);
      this.stats.evicted++;
      this.logDebug(`Evicted LRU entry: ${oldestEntry[0]}`);
    }
  }

  /**
   * Evicts entries to free memory
   */
  private evictToFreeMemory(neededBytes: number): void {
    const entries = Array.from(this.cache.entries()).sort(
      (a, b) => a[1].lastAccessedAt - b[1].lastAccessedAt,
    );

    let freedBytes = 0;
    let evictedCount = 0;

    for (const [capabilityId, entry] of entries) {
      if (freedBytes >= neededBytes) {
        break;
      }

      this.cache.delete(capabilityId);
      freedBytes += entry.estimatedSizeBytes;
      evictedCount++;
      this.stats.evicted++;
    }

    this.logDebug(`Evicted ${evictedCount} entries to free ${freedBytes} bytes`);
  }

  /**
   * Gets current memory usage
   */
  private getCurrentMemoryUsage(): number {
    return Array.from(this.cache.values()).reduce(
      (total, entry) => total + entry.estimatedSizeBytes,
      0,
    );
  }

  /**
   * Checks memory usage and warns if high
   */
  private checkMemoryUsage(): void {
    if (!this.config.performanceMonitoring.trackMemoryUsage) {
      return;
    }

    const usage = this.getCurrentMemoryUsage();
    const threshold =
      this.config.maxMemoryBytes * this.config.performanceMonitoring.highMemoryThreshold;

    if (usage > threshold) {
      this.logDebug(
        `High memory usage: ${usage} bytes (${((usage / this.config.maxMemoryBytes) * 100).toFixed(1)}%)`,
      );
    }
  }

  /**
   * Compacts cache if needed
   */
  private compactIfNeeded(): void {
    const memoryUsage = this.getCurrentMemoryUsage();
    const threshold = this.config.maxMemoryBytes * this.config.maintenance.compactionThreshold;

    if (memoryUsage > threshold) {
      // Remove entries marked for eviction and least accessed entries
      const entries = Array.from(this.cache.entries())
        .filter(([, entry]) => !entry.markedForEviction)
        .sort((a, b) => b[1].accessCount - a[1].accessCount)
        .slice(0, Math.floor(this.config.maxEntries * 0.8));

      this.cache.clear();
      for (const [capabilityId, entry] of entries) {
        this.cache.set(capabilityId, entry);
      }

      this.logDebug(`Compacted cache to ${this.cache.size} entries`);
    }
  }

  /**
   * Records a cache hit
   */
  private recordHit(): void {
    if (this.config.enableStatistics) {
      this.stats.hits++;
    }
  }

  /**
   * Records a cache miss
   */
  private recordMiss(): void {
    if (this.config.enableStatistics) {
      this.stats.misses++;
    }
  }

  /**
   * Starts automatic cleanup timer
   */
  private startAutoCleanup(): void {
    setInterval(() => {
      this.cleanup();
    }, this.config.maintenance.cleanupIntervalMs);
  }

  /**
   * Logs debug message if enabled
   */
  private logDebug(message: string): void {
    if (this.config.enableDebugLogging) {
      console.warn(`[CapabilityCacheManager] ${message}`);
    }
  }
}
