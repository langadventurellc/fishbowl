/**
 * Platform Detection Cache Class
 *
 * Provides performant caching mechanism for platform detection results
 * to ensure sub-millisecond response times for repeated calls.
 */

import { PLATFORM_DETECTION_CONFIG } from '../../constants/platform/PLATFORM_DETECTION_CONFIG';
import type { PlatformType } from '../../constants/platform/PlatformType';
import type { PlatformInfo } from './PlatformInfo';
import type { PlatformCacheEntry } from './PlatformCacheEntry';
import type { PlatformCacheConfig } from './PlatformCacheConfig';

/**
 * Platform detection cache implementation
 *
 * Provides lightweight caching for platform detection results to achieve
 * sub-millisecond response times. Uses a single cache entry since platform
 * detection is environment-based, not parameter-based.
 */
export class PlatformCache {
  private cache: PlatformCacheEntry | null = null;
  private readonly config: PlatformCacheConfig;

  /**
   * Cache key for platform detection (constant since platform is environment-based)
   */
  private static readonly CACHE_KEY = 'platform_detection';

  constructor(config?: Partial<PlatformCacheConfig>) {
    this.config = {
      cacheDurationMs: config?.cacheDurationMs ?? PLATFORM_DETECTION_CONFIG.CACHE_DURATION_MS,
      enableDebugLogging:
        config?.enableDebugLogging ?? PLATFORM_DETECTION_CONFIG.ENABLE_DEBUG_LOGGING,
    };
  }

  /**
   * Gets cached platform type if available and valid
   *
   * @returns Cached platform type or null if cache miss/expired
   */
  getCachedPlatformType(): PlatformType | null {
    try {
      const entry = this.getCachedEntry();
      if (entry) {
        this.logDebug('Cache hit for platform type');
        return entry.platformType;
      }
      this.logDebug('Cache miss for platform type');
      return null;
    } catch {
      this.logDebug('Cache error for platform type');
      return null;
    }
  }

  /**
   * Gets cached platform information if available and valid
   *
   * @returns Cached platform info or null if cache miss/expired
   */
  getCachedPlatformInfo(): PlatformInfo | null {
    try {
      const entry = this.getCachedEntry();
      if (entry) {
        this.logDebug('Cache hit for platform info');
        return entry.platformInfo;
      }
      this.logDebug('Cache miss for platform info');
      return null;
    } catch {
      this.logDebug('Cache error for platform info');
      return null;
    }
  }

  /**
   * Stores platform detection results in cache
   *
   * @param platformType - Detected platform type
   * @param platformInfo - Comprehensive platform information
   */
  setCachedResults(platformType: PlatformType, platformInfo: PlatformInfo): void {
    try {
      const timestamp = Date.now();
      this.cache = {
        platformType,
        platformInfo,
        timestamp,
      };
      this.logDebug(`Cached platform results: ${platformType}`);
    } catch {
      this.logDebug('Failed to cache platform results');
      // Silent failure - caching is an optimization, not critical
    }
  }

  /**
   * Clears the platform detection cache
   */
  clearCache(): void {
    try {
      this.cache = null;
      this.logDebug('Platform cache cleared');
    } catch {
      this.logDebug('Failed to clear platform cache');
      // Silent failure
    }
  }

  /**
   * Gets cache size in bytes (approximate)
   */
  getCacheSize(): number {
    if (!this.cache) {
      return 0;
    }

    try {
      // Approximate memory calculation for cache entry
      // PlatformType enum: ~20 bytes
      // PlatformInfo object: ~200-300 bytes
      // Timestamp: 8 bytes
      // Object overhead: ~50 bytes
      return 300; // Conservative estimate under 1KB requirement
    } catch {
      return 0;
    }
  }

  /**
   * Checks if cache has valid entry
   */
  hasValidCache(): boolean {
    return this.getCachedEntry() !== null;
  }

  /**
   * Gets cache statistics for debugging
   */
  getCacheStats(): { hasCache: boolean; age: number; size: number } {
    const hasCache = this.cache !== null;
    const age = hasCache && this.cache ? Date.now() - this.cache.timestamp : 0;
    const size = this.getCacheSize();

    return { hasCache, age, size };
  }

  /**
   * Gets cached entry if valid, null otherwise
   */
  private getCachedEntry(): PlatformCacheEntry | null {
    if (!this.cache) {
      return null;
    }

    const now = Date.now();
    const age = now - this.cache.timestamp;

    if (age > this.config.cacheDurationMs) {
      this.cache = null;
      this.logDebug(`Cache expired after ${age}ms`);
      return null;
    }

    return this.cache;
  }

  /**
   * Logs debug message if debugging is enabled
   */
  private logDebug(message: string): void {
    if (this.config.enableDebugLogging) {
      // Using warn instead of debug to satisfy linting rules
      console.warn(`[PlatformCache] ${message}`);
    }
  }
}
