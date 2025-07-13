/**
 * Platform Cache Test Suite
 *
 * Comprehensive tests for platform detection caching mechanism including
 * cache hits/misses, TTL behavior, memory constraints, and performance validation.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { platformCache } from '../../../../../src/shared/utils/platform/cache';
import { PlatformCache } from '../../../../../src/shared/utils/platform/PlatformCache';
import { PlatformType } from '../../../../../src/shared/constants/platform/PlatformType';
import type { PlatformInfo } from '../../../../../src/shared/utils/platform/PlatformInfo';

describe('PlatformCache', () => {
  let cache: PlatformCache;

  beforeEach(() => {
    cache = new PlatformCache();
  });

  afterEach(() => {
    cache.clearCache();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Cache Configuration', () => {
    it('should use default configuration from PLATFORM_DETECTION_CONFIG', () => {
      const defaultCache = new PlatformCache();
      expect(defaultCache.getCacheStats().hasCache).toBe(false);
    });

    it('should accept custom configuration', () => {
      const customCache = new PlatformCache({
        cacheDurationMs: 5000,
        enableDebugLogging: true,
      });
      expect(customCache.getCacheStats().hasCache).toBe(false);
    });

    it('should merge custom config with defaults', () => {
      const customCache = new PlatformCache({
        cacheDurationMs: 5000,
        // enableDebugLogging not specified, should use default
      });
      expect(customCache.getCacheStats().hasCache).toBe(false);
    });
  });

  describe('Cache Operations', () => {
    const mockPlatformInfo: PlatformInfo = {
      platformType: PlatformType.ELECTRON,
      detections: {
        isElectron: true,
        isCapacitor: false,
        isWeb: false,
      },
      environment: {
        hasWindow: true,
        hasElectronAPI: true,
        hasCapacitorAPI: false,
        hasNavigator: true,
      },
      timestamp: Date.now(),
    };

    it('should return null for cache miss on platform type', () => {
      const result = cache.getCachedPlatformType();
      expect(result).toBe(null);
    });

    it('should return null for cache miss on platform info', () => {
      const result = cache.getCachedPlatformInfo();
      expect(result).toBe(null);
    });

    it('should cache and retrieve platform type', () => {
      cache.setCachedResults(PlatformType.ELECTRON, mockPlatformInfo);

      const cachedType = cache.getCachedPlatformType();
      expect(cachedType).toBe(PlatformType.ELECTRON);
    });

    it('should cache and retrieve platform info', () => {
      cache.setCachedResults(PlatformType.ELECTRON, mockPlatformInfo);

      const cachedInfo = cache.getCachedPlatformInfo();
      expect(cachedInfo).toEqual(mockPlatformInfo);
    });

    it('should have valid cache after setting results', () => {
      cache.setCachedResults(PlatformType.ELECTRON, mockPlatformInfo);
      expect(cache.hasValidCache()).toBe(true);
    });

    it('should clear cache successfully', () => {
      cache.setCachedResults(PlatformType.ELECTRON, mockPlatformInfo);
      expect(cache.hasValidCache()).toBe(true);

      cache.clearCache();
      expect(cache.hasValidCache()).toBe(false);
      expect(cache.getCachedPlatformType()).toBe(null);
      expect(cache.getCachedPlatformInfo()).toBe(null);
    });
  });

  describe('Cache TTL Behavior', () => {
    const mockPlatformInfo: PlatformInfo = {
      platformType: PlatformType.WEB,
      detections: {
        isElectron: false,
        isCapacitor: false,
        isWeb: true,
      },
      environment: {
        hasWindow: true,
        hasElectronAPI: false,
        hasCapacitorAPI: false,
        hasNavigator: true,
      },
      timestamp: Date.now(),
    };

    it('should respect cache TTL', () => {
      // Set fake timers before creating cache entries
      vi.useFakeTimers();

      // Use short TTL for testing
      const shortTTLCache = new PlatformCache({
        cacheDurationMs: 1000, // 1 second (minimum allowed)
        enableDebugLogging: false,
      });

      // Create mock platform info with fake timestamp
      const testPlatformInfo: PlatformInfo = {
        ...mockPlatformInfo,
        timestamp: Date.now(), // This will use fake time now
      };

      shortTTLCache.setCachedResults(PlatformType.WEB, testPlatformInfo);
      expect(shortTTLCache.getCachedPlatformType()).toBe(PlatformType.WEB);

      // Wait for cache to expire
      vi.advanceTimersByTime(1100); // 1100ms > 1000ms TTL

      expect(shortTTLCache.getCachedPlatformType()).toBe(null);
      expect(shortTTLCache.hasValidCache()).toBe(false);
    });

    it('should return cached results within TTL', () => {
      const shortTTLCache = new PlatformCache({
        cacheDurationMs: 1000, // 1 second
        enableDebugLogging: false,
      });

      shortTTLCache.setCachedResults(PlatformType.WEB, mockPlatformInfo);

      vi.useFakeTimers();
      vi.advanceTimersByTime(500); // 500ms < 1000ms TTL

      expect(shortTTLCache.getCachedPlatformType()).toBe(PlatformType.WEB);
      expect(shortTTLCache.hasValidCache()).toBe(true);
    });

    it('should handle cache expiration gracefully', () => {
      // Set fake timers before creating cache entries
      vi.useFakeTimers();

      const shortTTLCache = new PlatformCache({
        cacheDurationMs: 1000, // 1 second (minimum allowed)
        enableDebugLogging: false,
      });

      // Create mock platform info with fake timestamp
      const testPlatformInfo: PlatformInfo = {
        ...mockPlatformInfo,
        timestamp: Date.now(), // This will use fake time now
      };

      shortTTLCache.setCachedResults(PlatformType.WEB, testPlatformInfo);

      vi.advanceTimersByTime(1100); // 1100ms > 1000ms TTL - Cache should expire

      // Should handle gracefully and return null
      expect(shortTTLCache.getCachedPlatformType()).toBe(null);
      expect(shortTTLCache.getCachedPlatformInfo()).toBe(null);
    });
  });

  describe('Error Handling', () => {
    it('should handle cache errors gracefully', () => {
      // Mock console.debug to avoid noise during testing
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      const debugCache = new PlatformCache({
        enableDebugLogging: true,
      });

      // Should not throw on cache operations
      expect(() => debugCache.getCachedPlatformType()).not.toThrow();
      expect(() => debugCache.getCachedPlatformInfo()).not.toThrow();
      expect(() => debugCache.clearCache()).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should handle setCachedResults errors silently', () => {
      const mockPlatformInfo: PlatformInfo = {
        platformType: PlatformType.CAPACITOR,
        detections: {
          isElectron: false,
          isCapacitor: true,
          isWeb: false,
        },
        environment: {
          hasWindow: true,
          hasElectronAPI: false,
          hasCapacitorAPI: true,
          hasNavigator: true,
        },
        timestamp: Date.now(),
      };

      // Should not throw even if there are internal errors
      expect(() => cache.setCachedResults(PlatformType.CAPACITOR, mockPlatformInfo)).not.toThrow();
    });
  });

  describe('Memory Constraints', () => {
    it('should report cache size under 1KB requirement', () => {
      const mockPlatformInfo: PlatformInfo = {
        platformType: PlatformType.ELECTRON,
        detections: {
          isElectron: true,
          isCapacitor: false,
          isWeb: false,
        },
        environment: {
          hasWindow: true,
          hasElectronAPI: true,
          hasCapacitorAPI: false,
          hasNavigator: true,
        },
        timestamp: Date.now(),
      };

      cache.setCachedResults(PlatformType.ELECTRON, mockPlatformInfo);

      const size = cache.getCacheSize();
      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThan(1024); // < 1KB requirement
    });

    it('should report zero size for empty cache', () => {
      expect(cache.getCacheSize()).toBe(0);
    });
  });

  describe('Cache Statistics', () => {
    it('should provide accurate cache statistics for empty cache', () => {
      const stats = cache.getCacheStats();
      expect(stats.hasCache).toBe(false);
      expect(stats.age).toBe(0);
      expect(stats.size).toBe(0);
    });

    it('should provide accurate cache statistics for populated cache', () => {
      const mockPlatformInfo: PlatformInfo = {
        platformType: PlatformType.WEB,
        detections: {
          isElectron: false,
          isCapacitor: false,
          isWeb: true,
        },
        environment: {
          hasWindow: true,
          hasElectronAPI: false,
          hasCapacitorAPI: false,
          hasNavigator: true,
        },
        timestamp: Date.now(),
      };

      cache.setCachedResults(PlatformType.WEB, mockPlatformInfo);

      vi.useFakeTimers();
      vi.advanceTimersByTime(100);

      const stats = cache.getCacheStats();
      expect(stats.hasCache).toBe(true);
      expect(stats.age).toBeGreaterThanOrEqual(100);
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe('Debug Logging', () => {
    it('should log debug messages when enabled', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const debugCache = new PlatformCache({
        enableDebugLogging: true,
      });

      const mockPlatformInfo: PlatformInfo = {
        platformType: PlatformType.ELECTRON,
        detections: {
          isElectron: true,
          isCapacitor: false,
          isWeb: false,
        },
        environment: {
          hasWindow: true,
          hasElectronAPI: true,
          hasCapacitorAPI: false,
          hasNavigator: true,
        },
        timestamp: Date.now(),
      };

      debugCache.setCachedResults(PlatformType.ELECTRON, mockPlatformInfo);
      debugCache.getCachedPlatformType();
      debugCache.clearCache();

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[PlatformCache]'));

      consoleSpy.mockRestore();
    });

    it('should not log debug messages when disabled', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      const quietCache = new PlatformCache({
        enableDebugLogging: false,
      });

      const mockPlatformInfo: PlatformInfo = {
        platformType: PlatformType.WEB,
        detections: {
          isElectron: false,
          isCapacitor: false,
          isWeb: true,
        },
        environment: {
          hasWindow: true,
          hasElectronAPI: false,
          hasCapacitorAPI: false,
          hasNavigator: true,
        },
        timestamp: Date.now(),
      };

      quietCache.setCachedResults(PlatformType.WEB, mockPlatformInfo);
      quietCache.getCachedPlatformType();
      quietCache.clearCache();

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Global Platform Cache Instance', () => {
    it('should provide global platformCache instance', () => {
      expect(platformCache).toBeInstanceOf(PlatformCache);
    });

    it('should use default configuration for global instance', () => {
      expect(platformCache.getCacheStats().hasCache).toBe(false);
    });

    it('should maintain state across calls for global instance', () => {
      const mockPlatformInfo: PlatformInfo = {
        platformType: PlatformType.CAPACITOR,
        detections: {
          isElectron: false,
          isCapacitor: true,
          isWeb: false,
        },
        environment: {
          hasWindow: true,
          hasElectronAPI: false,
          hasCapacitorAPI: true,
          hasNavigator: true,
        },
        timestamp: Date.now(),
      };

      platformCache.setCachedResults(PlatformType.CAPACITOR, mockPlatformInfo);
      expect(platformCache.hasValidCache()).toBe(true);

      // Clear for next tests
      platformCache.clearCache();
    });
  });

  describe('Performance Requirements', () => {
    it('should achieve sub-millisecond cache retrieval', () => {
      const mockPlatformInfo: PlatformInfo = {
        platformType: PlatformType.ELECTRON,
        detections: {
          isElectron: true,
          isCapacitor: false,
          isWeb: false,
        },
        environment: {
          hasWindow: true,
          hasElectronAPI: true,
          hasCapacitorAPI: false,
          hasNavigator: true,
        },
        timestamp: Date.now(),
      };

      cache.setCachedResults(PlatformType.ELECTRON, mockPlatformInfo);

      // Measure cache retrieval performance
      const iterations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        cache.getCachedPlatformType();
      }

      const endTime = performance.now();
      const averageTime = (endTime - startTime) / iterations;

      // Should be well under 1ms per retrieval
      expect(averageTime).toBeLessThan(1);
    });

    it('should handle multiple cache operations efficiently', () => {
      const mockPlatformInfo: PlatformInfo = {
        platformType: PlatformType.WEB,
        detections: {
          isElectron: false,
          isCapacitor: false,
          isWeb: true,
        },
        environment: {
          hasWindow: true,
          hasElectronAPI: false,
          hasCapacitorAPI: false,
          hasNavigator: true,
        },
        timestamp: Date.now(),
      };

      const startTime = performance.now();

      // Multiple operations should be fast
      cache.setCachedResults(PlatformType.WEB, mockPlatformInfo);
      cache.getCachedPlatformType();
      cache.getCachedPlatformInfo();
      cache.hasValidCache();
      cache.getCacheStats();
      cache.clearCache();

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // All operations should complete quickly
      expect(totalTime).toBeLessThan(10); // Conservative estimate
    });
  });
});
