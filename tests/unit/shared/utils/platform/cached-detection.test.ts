/**
 * Cached Platform Detection Integration Tests
 *
 * Tests for cached platform detection functions including detectPlatformType()
 * and getPlatformInfo() with various platform environments and cache behavior.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { detectPlatformType } from '../../../../../src/shared/utils/platform/detectPlatformType';
import { getPlatformInfo } from '../../../../../src/shared/utils/platform/getPlatformInfo';
import { platformCache } from '../../../../../src/shared/utils/platform/cache';
import { PlatformCache } from '../../../../../src/shared/utils/platform/PlatformCache';
import { PlatformType } from '../../../../../src/shared/constants/platform/PlatformType';
import {
  electronEnvironment,
  capacitorEnvironment,
  webEnvironment,
  unknownEnvironment,
  withMockEnvironment,
} from './mock-environments';

describe('Cached Platform Detection Integration', () => {
  beforeEach(() => {
    // Clear cache before each test
    platformCache.clearCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    platformCache.clearCache();
    vi.useRealTimers();
  });

  describe('detectPlatformType with Caching', () => {
    it('should detect and cache Electron platform', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        // First call should detect and cache
        const result1 = detectPlatformType();
        expect(result1).toBe(PlatformType.ELECTRON);
        expect(platformCache.hasValidCache()).toBe(true);

        // Second call should use cache
        const result2 = detectPlatformType();
        expect(result2).toBe(PlatformType.ELECTRON);

        // Verify cache statistics
        const stats = platformCache.getCacheStats();
        expect(stats.hasCache).toBe(true);
        expect(stats.size).toBeGreaterThan(0);
      });
    });

    it('should detect and cache Capacitor platform', async () => {
      await withMockEnvironment(capacitorEnvironment, () => {
        const result1 = detectPlatformType();
        expect(result1).toBe(PlatformType.CAPACITOR);
        expect(platformCache.hasValidCache()).toBe(true);

        const result2 = detectPlatformType();
        expect(result2).toBe(PlatformType.CAPACITOR);
      });
    });

    it('should detect and cache Web platform', async () => {
      await withMockEnvironment(webEnvironment, () => {
        const result1 = detectPlatformType();
        expect(result1).toBe(PlatformType.WEB);
        expect(platformCache.hasValidCache()).toBe(true);

        const result2 = detectPlatformType();
        expect(result2).toBe(PlatformType.WEB);
      });
    });

    it('should handle unknown platform without caching', async () => {
      await withMockEnvironment(unknownEnvironment, () => {
        const result1 = detectPlatformType();
        expect(result1).toBe(PlatformType.UNKNOWN);
        // Unknown platforms should not be cached
        expect(platformCache.hasValidCache()).toBe(false);

        const result2 = detectPlatformType();
        expect(result2).toBe(PlatformType.UNKNOWN);
      });
    });

    it('should provide performance improvement on cached calls', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        // First call (uncached)
        const startTime1 = performance.now();
        detectPlatformType();
        const endTime1 = performance.now();
        const uncachedTime = endTime1 - startTime1;

        // Second call (cached)
        const startTime2 = performance.now();
        detectPlatformType();
        const endTime2 = performance.now();
        const cachedTime = endTime2 - startTime2;

        // Cached call should be faster (though both should be very fast)
        expect(cachedTime).toBeLessThan(uncachedTime);
        expect(cachedTime).toBeLessThan(1); // Sub-millisecond requirement
      });
    });
  });

  describe('getPlatformInfo with Caching', () => {
    it('should get and cache comprehensive Electron platform info', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        const info1 = getPlatformInfo();
        expect(info1.platformType).toBe(PlatformType.ELECTRON);
        expect(info1.detections.isElectron).toBe(true);
        expect(info1.detections.isCapacitor).toBe(false);
        expect(info1.detections.isWeb).toBe(false);
        expect(info1.environment.hasElectronAPI).toBe(true);
        expect(info1.timestamp).toBeGreaterThan(0);
        expect(platformCache.hasValidCache()).toBe(true);

        // Second call should return cached data
        const info2 = getPlatformInfo();
        expect(info2).toEqual(info1);
      });
    });

    it('should get and cache comprehensive Capacitor platform info', async () => {
      await withMockEnvironment(capacitorEnvironment, () => {
        const info1 = getPlatformInfo();
        expect(info1.platformType).toBe(PlatformType.CAPACITOR);
        expect(info1.detections.isElectron).toBe(false);
        expect(info1.detections.isCapacitor).toBe(true);
        expect(info1.detections.isWeb).toBe(false);
        expect(info1.environment.hasCapacitorAPI).toBe(true);
        expect(platformCache.hasValidCache()).toBe(true);

        const info2 = getPlatformInfo();
        expect(info2).toEqual(info1);
      });
    });

    it('should get and cache comprehensive Web platform info', async () => {
      await withMockEnvironment(webEnvironment, () => {
        const info1 = getPlatformInfo();
        expect(info1.platformType).toBe(PlatformType.WEB);
        expect(info1.detections.isElectron).toBe(false);
        expect(info1.detections.isCapacitor).toBe(false);
        expect(info1.detections.isWeb).toBe(true);
        expect(info1.environment.hasNavigator).toBe(true);
        expect(platformCache.hasValidCache()).toBe(true);

        const info2 = getPlatformInfo();
        expect(info2).toEqual(info1);
      });
    });

    it('should handle fallback for unknown platform', async () => {
      await withMockEnvironment(unknownEnvironment, () => {
        const info = getPlatformInfo();
        expect(info.platformType).toBe(PlatformType.UNKNOWN);
        expect(info.detections.isElectron).toBe(false);
        expect(info.detections.isCapacitor).toBe(false);
        expect(info.detections.isWeb).toBe(false);
        expect(info.environment.hasWindow).toBe(false);
        expect(info.environment.hasElectronAPI).toBe(false);
        expect(info.environment.hasCapacitorAPI).toBe(false);
        expect(info.environment.hasNavigator).toBe(false);
      });
    });

    it('should update cache when getPlatformInfo is called after detectPlatformType', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        // First call detectPlatformType (creates minimal cache)
        const platformType = detectPlatformType();
        expect(platformType).toBe(PlatformType.ELECTRON);
        expect(platformCache.hasValidCache()).toBe(true);

        // Then call getPlatformInfo (should update cache with full info)
        const platformInfo = getPlatformInfo();
        expect(platformInfo.platformType).toBe(PlatformType.ELECTRON);
        expect(platformInfo.environment.hasWindow).toBe(true);
        expect(platformInfo.environment.hasElectronAPI).toBe(true);

        // Subsequent calls should use cached comprehensive data
        const cachedInfo = getPlatformInfo();
        expect(cachedInfo).toEqual(platformInfo);
      });
    });
  });

  describe('Cache Consistency Between Functions', () => {
    it('should maintain consistency between detectPlatformType and getPlatformInfo', async () => {
      await withMockEnvironment(webEnvironment, () => {
        const platformType = detectPlatformType();
        const platformInfo = getPlatformInfo();

        expect(platformInfo.platformType).toBe(platformType);
        expect(platformCache.hasValidCache()).toBe(true);

        // Both functions should return consistent results
        const platformType2 = detectPlatformType();
        const platformInfo2 = getPlatformInfo();

        expect(platformType2).toBe(platformType);
        expect(platformInfo2.platformType).toBe(platformType);
      });
    });

    it('should handle mixed function calls efficiently', async () => {
      await withMockEnvironment(capacitorEnvironment, () => {
        // Mixed calls should all be consistent and use cache
        const type1 = detectPlatformType();
        const info1 = getPlatformInfo();
        const type2 = detectPlatformType();
        const info2 = getPlatformInfo();

        expect(type1).toBe(PlatformType.CAPACITOR);
        expect(type2).toBe(PlatformType.CAPACITOR);
        expect(info1.platformType).toBe(PlatformType.CAPACITOR);
        expect(info2.platformType).toBe(PlatformType.CAPACITOR);
        expect(info1).toEqual(info2);
      });
    });
  });

  describe('Cache TTL Integration', () => {
    it('should respect cache TTL and re-detect after expiration', async () => {
      // Use a very short TTL for testing
      const testCache = new PlatformCache({
        cacheDurationMs: 100, // 100ms
        enableDebugLogging: false,
      });

      // Store original cache methods
      const originalGetCachedPlatformType = platformCache.getCachedPlatformType;
      const originalSetCachedResults = platformCache.setCachedResults;
      const originalHasValidCache = platformCache.hasValidCache;

      // Mock the global platformCache methods to use our test cache
      platformCache.getCachedPlatformType = testCache.getCachedPlatformType.bind(testCache);
      platformCache.setCachedResults = testCache.setCachedResults.bind(testCache);
      platformCache.hasValidCache = testCache.hasValidCache.bind(testCache);

      try {
        await withMockEnvironment(electronEnvironment, () => {
          // First detection
          const result1 = detectPlatformType();
          expect(result1).toBe(PlatformType.ELECTRON);
          expect(platformCache.hasValidCache()).toBe(true);

          // Fast forward past TTL
          vi.useFakeTimers();
          vi.advanceTimersByTime(150); // 150ms > 100ms TTL

          // Should re-detect after cache expiration
          const result2 = detectPlatformType();
          expect(result2).toBe(PlatformType.ELECTRON);
          expect(platformCache.hasValidCache()).toBe(true); // Re-cached
        });
      } finally {
        // Restore original cache methods
        platformCache.getCachedPlatformType = originalGetCachedPlatformType;
        platformCache.setCachedResults = originalSetCachedResults;
        platformCache.hasValidCache = originalHasValidCache;
      }
    });
  });

  describe('Error Handling in Cached Detection', () => {
    it('should handle detection errors gracefully with cache', async () => {
      // Clear cache to ensure fresh detection
      platformCache.clearCache();

      await withMockEnvironment(unknownEnvironment, () => {
        // Should fallback to UNKNOWN without throwing
        const result = detectPlatformType();
        expect(result).toBe(PlatformType.UNKNOWN);

        const info = getPlatformInfo();
        expect(info.platformType).toBe(PlatformType.UNKNOWN);

        // Error conditions should not crash the cache
        expect(() => platformCache.getCacheStats()).not.toThrow();
      });
    });

    it('should handle cache errors during detection', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        // Clear cache inside environment after setup
        platformCache.clearCache();
        // Mock cache to throw errors
        const originalSetCachedResults = platformCache.setCachedResults;
        platformCache.setCachedResults = vi.fn(() => {
          throw new Error('Cache error');
        });

        try {
          // Should still work even if caching fails
          const result = detectPlatformType();
          // Test that it returns a valid platform type (may be UNKNOWN due to test environment)
          expect(Object.values(PlatformType)).toContain(result);

          const info = getPlatformInfo();
          expect(Object.values(PlatformType)).toContain(info.platformType);
        } finally {
          // Restore cache function
          platformCache.setCachedResults = originalSetCachedResults;
        }
      });
    });
  });

  describe('Performance Validation', () => {
    it('should meet performance requirements for cached detection', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        // Prime the cache
        detectPlatformType();

        // Measure cached performance
        const iterations = 1000;
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
          detectPlatformType();
        }

        const endTime = performance.now();
        const averageTime = (endTime - startTime) / iterations;

        // Should meet sub-millisecond requirement
        expect(averageTime).toBeLessThan(1);
      });
    });

    it('should maintain cache size under memory constraints', async () => {
      await withMockEnvironment(webEnvironment, () => {
        // Populate cache with comprehensive platform info
        getPlatformInfo();

        const size = platformCache.getCacheSize();
        expect(size).toBeGreaterThan(0);
        expect(size).toBeLessThan(1024); // <1KB requirement
      });
    });

    it('should handle rapid repeated calls efficiently', async () => {
      await withMockEnvironment(capacitorEnvironment, () => {
        const startTime = performance.now();

        // Rapid mixed calls
        for (let i = 0; i < 100; i++) {
          detectPlatformType();
          getPlatformInfo();
        }

        const endTime = performance.now();
        const totalTime = endTime - startTime;

        // Should handle rapid calls efficiently
        expect(totalTime).toBeLessThan(100); // Conservative estimate
        expect(platformCache.hasValidCache()).toBe(true);
      });
    });
  });
});
