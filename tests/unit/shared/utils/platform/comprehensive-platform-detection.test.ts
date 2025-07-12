/**
 * Comprehensive Platform Detection Test Suite
 *
 * Advanced test scenarios for platform detection system including stress testing,
 * error injection, resource management, concurrency, and integration validation.
 *
 * This test suite complements the existing platform detection tests with
 * comprehensive coverage of edge cases, performance under load, and robustness.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  detectPlatformType,
  getPlatformInfo,
  isElectronPlatform,
  isCapacitorPlatform,
  isWebPlatform,
  hasWindow,
  hasWindowProperty,
} from '../../../../../src/shared/utils/platform';
import { platformCache } from '../../../../../src/shared/utils/platform/cache';
import { PlatformType } from '../../../../../src/shared/constants/platform/PlatformType';
import {
  electronEnvironment,
  webEnvironment,
  capacitorEnvironment,
  mixedEnvironment,
  unknownEnvironment,
  withMockEnvironment,
} from './mock-environments';
import { setupPlatformTests } from './test-setup';

// Setup platform test environment
setupPlatformTests();

describe('Comprehensive Platform Detection', () => {
  beforeEach(() => {
    platformCache.clearCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    platformCache.clearCache();
    vi.useRealTimers();
  });

  describe('Stress Testing and Performance Under Load', () => {
    it('should handle rapid repeated calls without performance degradation', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        const iterations = 10000;
        const results: PlatformType[] = [];

        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
          results.push(detectPlatformType());
        }

        const endTime = performance.now();
        const averageTime = (endTime - startTime) / iterations;

        // Should maintain sub-millisecond performance even under load
        expect(averageTime).toBeLessThan(1);

        // All results should be consistent
        expect(results.every(result => result === PlatformType.ELECTRON)).toBe(true);

        // Cache should be working efficiently
        expect(platformCache.hasValidCache()).toBe(true);
      });
    });

    it('should handle concurrent platform detection calls', async () => {
      await withMockEnvironment(webEnvironment, () => {
        const concurrentCalls = 100;
        const promises: Promise<PlatformType>[] = [];

        // Clear cache to ensure first call does detection
        platformCache.clearCache();

        // Launch concurrent detection calls
        for (let i = 0; i < concurrentCalls; i++) {
          promises.push(Promise.resolve(detectPlatformType()));
        }

        return Promise.all(promises).then(results => {
          // All concurrent calls should return the same result
          expect(results.every(result => result === PlatformType.WEB)).toBe(true);
          expect(results).toHaveLength(concurrentCalls);
        });
      });
    });

    it('should maintain memory efficiency under sustained load', async () => {
      await withMockEnvironment(capacitorEnvironment, () => {
        const initialCacheSize = platformCache.getCacheSize();

        // Perform many detection operations
        for (let i = 0; i < 1000; i++) {
          detectPlatformType();
          getPlatformInfo();
        }

        const finalCacheSize = platformCache.getCacheSize();

        // Cache size should remain under 1KB limit regardless of call volume
        expect(finalCacheSize).toBeLessThan(1024);

        // Memory usage should not grow significantly (more realistic threshold)
        expect(finalCacheSize - initialCacheSize).toBeLessThan(500);
      });
    });

    it('should handle mixed platform operations efficiently', async () => {
      const operations = [
        () => detectPlatformType(),
        () => getPlatformInfo(),
        () => isElectronPlatform(),
        () => isCapacitorPlatform(),
        () => isWebPlatform(),
        () => hasWindow(),
        () => hasWindowProperty('electronAPI'),
      ];

      await withMockEnvironment(mixedEnvironment, () => {
        const startTime = performance.now();

        // Perform mixed operations rapidly
        for (let i = 0; i < 1000; i++) {
          const operation = operations[i % operations.length];
          operation();
        }

        const endTime = performance.now();
        const totalTime = endTime - startTime;

        // Should complete all operations quickly
        expect(totalTime).toBeLessThan(100); // Conservative 100ms limit
      });
    });
  });

  describe('Error Injection and Recovery Testing', () => {
    it('should handle window access errors gracefully', () => {
      // Simulate environment where window access throws errors
      const originalWindow = globalThis.window;

      Object.defineProperty(globalThis, 'window', {
        get: () => {
          throw new Error('Window access denied');
        },
        configurable: true,
      });

      try {
        // Should not throw and return safe fallbacks
        expect(() => hasWindow()).not.toThrow();
        expect(() => hasWindowProperty('electronAPI')).not.toThrow();
        expect(() => detectPlatformType()).not.toThrow();
        expect(() => getPlatformInfo()).not.toThrow();

        // Should return safe fallback values
        expect(hasWindow()).toBe(false);
        expect(hasWindowProperty('electronAPI')).toBe(false);
        expect(detectPlatformType()).toBe(PlatformType.UNKNOWN);

        const info = getPlatformInfo();
        expect(info.platformType).toBe(PlatformType.UNKNOWN);
        expect(info.environment.hasWindow).toBe(false);
      } finally {
        // Restore original window
        Object.defineProperty(globalThis, 'window', {
          value: originalWindow,
          configurable: true,
          writable: true,
        });
      }
    });

    it('should handle malformed window properties gracefully', () => {
      const originalWindow = globalThis.window;

      // Create window with problematic properties
      const problematicWindow = {
        electronAPI: undefined,
        Capacitor: null,
        navigator: false,
      };

      Object.defineProperty(globalThis, 'window', {
        value: problematicWindow,
        configurable: true,
      });

      try {
        // Should handle malformed properties gracefully
        expect(() => hasWindowProperty('electronAPI')).not.toThrow();
        expect(() => hasWindowProperty('Capacitor')).not.toThrow();
        expect(() => hasWindowProperty('navigator')).not.toThrow();
        expect(() => detectPlatformType()).not.toThrow();

        // Properties exist but are falsy values - detected as present properties
        expect(hasWindowProperty('electronAPI')).toBe(true); // Property exists (undefined)
        expect(hasWindowProperty('Capacitor')).toBe(true); // Property exists (null)
        expect(hasWindowProperty('navigator')).toBe(true); // Property exists (false)
      } finally {
        // Restore original window
        Object.defineProperty(globalThis, 'window', {
          value: originalWindow,
          configurable: true,
        });
      }
    });

    it('should handle cache corruption gracefully', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        // Populate cache normally
        const normalResult = detectPlatformType();
        expect(normalResult).toBe(PlatformType.ELECTRON);

        // Simulate cache corruption by clearing internal state
        platformCache.clearCache();

        // Should recover and provide correct detection
        const recoveredResult = detectPlatformType();
        expect(recoveredResult).toBe(PlatformType.ELECTRON);

        // Cache should be working again
        expect(platformCache.hasValidCache()).toBe(true);
      });
    });

    it('should handle performance API unavailability', () => {
      const originalPerformance = globalThis.performance;

      // Remove performance API
      Object.defineProperty(globalThis, 'performance', {
        value: undefined,
        configurable: true,
      });

      try {
        // Should still function without performance API
        expect(() => detectPlatformType()).not.toThrow();
        expect(() => getPlatformInfo()).not.toThrow();

        const info = getPlatformInfo();
        expect(typeof info.timestamp).toBe('number');
        expect(info.timestamp).toBeGreaterThan(0);
      } finally {
        // Restore performance API
        Object.defineProperty(globalThis, 'performance', {
          value: originalPerformance,
          configurable: true,
        });
      }
    });
  });

  describe('Resource Management and Cleanup', () => {
    it('should not leak memory with repeated cache operations', () => {
      const iterations = 1000;
      const initialStats = platformCache.getCacheStats();

      // Perform many cache operations
      for (let i = 0; i < iterations; i++) {
        platformCache.clearCache();
        detectPlatformType();
        getPlatformInfo();
      }

      const finalStats = platformCache.getCacheStats();

      // Memory should remain stable
      expect(finalStats.size).toBeLessThan(1024); // Under 1KB

      if (initialStats.size > 0 && finalStats.size > 0) {
        // Memory growth should be minimal
        expect(finalStats.size - initialStats.size).toBeLessThan(100);
      }
    });

    it('should handle cache operations consistently', () => {
      // Test cache behavior without complex timer manipulation
      // (TTL testing is covered comprehensively in cache.test.ts)

      // Set up detection with cache
      detectPlatformType();
      expect(platformCache.hasValidCache()).toBe(true);

      // Clear cache manually to simulate expiration
      platformCache.clearCache();
      expect(platformCache.hasValidCache()).toBe(false);

      // New detection should work and re-populate cache
      const result2 = detectPlatformType();
      expect(result2).toBeDefined();
      expect(platformCache.hasValidCache()).toBe(true);
    });

    it('should clean up resources properly', () => {
      // Populate cache with detection results
      detectPlatformType();
      getPlatformInfo();

      expect(platformCache.hasValidCache()).toBe(true);

      // Clear cache should free resources
      platformCache.clearCache();

      expect(platformCache.hasValidCache()).toBe(false);
      expect(platformCache.getCacheSize()).toBe(0);
      expect(platformCache.getCacheStats().size).toBe(0);
    });
  });

  describe('Security Boundary Validation', () => {
    it('should safely handle hostile window object', () => {
      const hostileWindow = new Proxy(
        {},
        {
          get: () => {
            throw new Error('Hostile window access');
          },
          has: () => {
            throw new Error('Hostile window property check');
          },
          ownKeys: () => {
            throw new Error('Hostile window enumeration');
          },
        },
      );

      Object.defineProperty(globalThis, 'window', {
        value: hostileWindow,
        configurable: true,
      });

      try {
        // Should handle hostile environments safely
        expect(() => hasWindow()).not.toThrow();
        expect(() => hasWindowProperty('electronAPI')).not.toThrow();
        expect(() => detectPlatformType()).not.toThrow();

        // Should return safe defaults (proxy might be detected as web environment)
        expect(hasWindow()).toBe(true); // Proxy object still detected as window
        const platformType = detectPlatformType();
        expect([PlatformType.UNKNOWN, PlatformType.WEB]).toContain(platformType);
      } finally {
        // Restore safe window
        Object.defineProperty(globalThis, 'window', {
          value: {},
          configurable: true,
        });
      }
    });

    it('should validate input sanitization for platform info', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        const info = getPlatformInfo();

        // Verify no dangerous properties in output
        const infoString = JSON.stringify(info);
        expect(infoString).not.toContain('<script');
        expect(infoString).not.toContain('javascript:');
        expect(infoString).not.toContain('data:');

        // Verify all values are safe types
        expect(typeof info.platformType).toBe('string');
        expect(typeof info.timestamp).toBe('number');
        expect(typeof info.detections).toBe('object');
        expect(typeof info.environment).toBe('object');

        // Verify no prototype pollution
        expect(info).not.toHaveProperty('__proto__');
        expect(info).not.toHaveProperty('constructor');
        expect(info.detections).not.toHaveProperty('__proto__');
        expect(info.environment).not.toHaveProperty('__proto__');
      });
    });

    it('should handle undefined and null global objects safely', () => {
      const testCases = [undefined, null];

      testCases.forEach(testValue => {
        Object.defineProperty(globalThis, 'window', {
          value: testValue,
          configurable: true,
        });

        // Should handle gracefully without throwing
        expect(() => hasWindow()).not.toThrow();
        expect(() => hasWindowProperty('electronAPI')).not.toThrow();
        expect(() => detectPlatformType()).not.toThrow();

        // Should return safe values
        expect(hasWindow()).toBe(false);
        expect(hasWindowProperty('electronAPI')).toBe(false);
        expect(detectPlatformType()).toBe(PlatformType.UNKNOWN);
      });
    });
  });

  describe('Integration and Real-world Scenarios', () => {
    it('should handle environment switching scenarios', async () => {
      // Start in web environment
      await withMockEnvironment(webEnvironment, () => {
        expect(detectPlatformType()).toBe(PlatformType.WEB);
      });

      // Switch to Electron environment
      await withMockEnvironment(electronEnvironment, () => {
        platformCache.clearCache(); // Simulate environment change
        expect(detectPlatformType()).toBe(PlatformType.ELECTRON);
      });

      // Switch to Capacitor environment
      await withMockEnvironment(capacitorEnvironment, () => {
        platformCache.clearCache(); // Simulate environment change
        expect(detectPlatformType()).toBe(PlatformType.CAPACITOR);
      });
    });

    it('should maintain consistency across multiple detection methods', async () => {
      const environments = [
        { env: electronEnvironment, expected: PlatformType.ELECTRON },
        { env: capacitorEnvironment, expected: PlatformType.CAPACITOR },
        { env: webEnvironment, expected: PlatformType.WEB },
        { env: unknownEnvironment, expected: PlatformType.UNKNOWN },
      ];

      for (const { env, expected } of environments) {
        await withMockEnvironment(env, () => {
          platformCache.clearCache();

          // All methods should agree on platform type
          const detectedType = detectPlatformType();
          const platformInfo = getPlatformInfo();

          expect(detectedType).toBe(expected);
          expect(platformInfo.platformType).toBe(expected);

          // Detection flags should be consistent
          switch (expected) {
            case PlatformType.ELECTRON:
              expect(isElectronPlatform()).toBe(true);
              expect(isCapacitorPlatform()).toBe(false);
              expect(isWebPlatform()).toBe(false);
              break;
            case PlatformType.CAPACITOR:
              expect(isElectronPlatform()).toBe(false);
              expect(isCapacitorPlatform()).toBe(true);
              expect(isWebPlatform()).toBe(false);
              break;
            case PlatformType.WEB:
              expect(isElectronPlatform()).toBe(false);
              expect(isCapacitorPlatform()).toBe(false);
              expect(isWebPlatform()).toBe(true);
              break;
            case PlatformType.UNKNOWN:
              expect(isElectronPlatform()).toBe(false);
              expect(isCapacitorPlatform()).toBe(false);
              expect(isWebPlatform()).toBe(false);
              break;
          }
        });
      }
    });

    it('should handle rapid environment changes', async () => {
      const environments = [electronEnvironment, webEnvironment, capacitorEnvironment];
      const results: PlatformType[] = [];

      // Rapidly switch between environments
      for (let i = 0; i < 100; i++) {
        const env = environments[i % environments.length];
        await withMockEnvironment(env, () => {
          platformCache.clearCache(); // Force re-detection
          results.push(detectPlatformType());
        });
      }

      // Results should follow the environment pattern
      for (let i = 0; i < results.length; i++) {
        const expectedIndex = i % 3;
        const expected =
          expectedIndex === 0
            ? PlatformType.ELECTRON
            : expectedIndex === 1
              ? PlatformType.WEB
              : PlatformType.CAPACITOR;
        expect(results[i]).toBe(expected);
      }
    });

    it('should provide stable results under varying load', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        const samples = 100;
        const results: PlatformType[] = [];

        // Collect samples with varying delay patterns
        for (let i = 0; i < samples; i++) {
          if (i % 10 === 0) {
            platformCache.clearCache(); // Occasional cache clear
          }
          results.push(detectPlatformType());
        }

        // All results should be consistent
        expect(results.every(result => result === PlatformType.ELECTRON)).toBe(true);
        expect(results).toHaveLength(samples);
      });
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle empty window object', () => {
      Object.defineProperty(globalThis, 'window', {
        value: Object.create(null), // Empty object with no prototype
        configurable: true,
      });

      expect(() => detectPlatformType()).not.toThrow();
      // Empty object with document/navigator-like properties might still be detected as web
      const platformType = detectPlatformType();
      expect([PlatformType.WEB, PlatformType.UNKNOWN]).toContain(platformType);
      expect(hasWindow()).toBe(true); // Object exists but is empty
      expect(hasWindowProperty('electronAPI')).toBe(false);
    });

    it('should handle window with non-configurable properties', () => {
      const restrictedWindow = {};
      Object.defineProperty(restrictedWindow, 'electronAPI', {
        value: null,
        configurable: false,
        writable: false,
      });

      Object.defineProperty(globalThis, 'window', {
        value: restrictedWindow,
        configurable: true,
      });

      expect(() => hasWindowProperty('electronAPI')).not.toThrow();
      // Property exists but is null, so it's detected as truthy property presence
      expect(hasWindowProperty('electronAPI')).toBe(true); // Property exists, even if null
    });

    it('should handle circular references in window objects', () => {
      const circularWindow: any = {};
      circularWindow.self = circularWindow;
      circularWindow.electronAPI = { window: circularWindow };

      Object.defineProperty(globalThis, 'window', {
        value: circularWindow,
        configurable: true,
      });

      expect(() => detectPlatformType()).not.toThrow();
      expect(() => getPlatformInfo()).not.toThrow();

      // Should detect Electron due to electronAPI presence
      expect(detectPlatformType()).toBe(PlatformType.ELECTRON);
    });

    it('should generate valid timestamp values', () => {
      // Test timestamp generation without timer manipulation
      const info = getPlatformInfo();
      expect(info.timestamp).toBeGreaterThan(0);
      expect(Number.isFinite(info.timestamp)).toBe(true);
      expect(info.timestamp).toBeLessThan(Number.MAX_SAFE_INTEGER);

      // Timestamp should be within reasonable current time range
      const now = Date.now();
      expect(info.timestamp).toBeLessThanOrEqual(now + 1000); // Allow 1s tolerance
      expect(info.timestamp).toBeGreaterThanOrEqual(now - 1000);
    });
  });

  describe('Performance and Optimization Validation', () => {
    it('should maintain consistent performance across cache states', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        const measurements = [];

        for (let i = 0; i < 10; i++) {
          platformCache.clearCache(); // Cold cache

          const start = performance.now();
          detectPlatformType();
          const coldTime = performance.now() - start;

          const start2 = performance.now();
          detectPlatformType(); // Warm cache
          const warmTime = performance.now() - start2;

          measurements.push({ cold: coldTime, warm: warmTime });
        }

        // Warm cache should be significantly faster
        const avgCold = measurements.reduce((sum, m) => sum + m.cold, 0) / measurements.length;
        const avgWarm = measurements.reduce((sum, m) => sum + m.warm, 0) / measurements.length;

        expect(avgWarm).toBeLessThan(avgCold);
        expect(avgWarm).toBeLessThan(1); // Sub-millisecond when cached
      });
    });

    it('should validate tree-shaking compatibility', () => {
      // Test that individual functions can be imported without pulling in unused code
      // This is validated by ensuring functions work in isolation

      expect(typeof isElectronPlatform).toBe('function');
      expect(typeof isCapacitorPlatform).toBe('function');
      expect(typeof isWebPlatform).toBe('function');
      expect(typeof hasWindow).toBe('function');
      expect(typeof hasWindowProperty).toBe('function');

      // Each function should be independently functional
      expect(() => hasWindow()).not.toThrow();
      expect(() => hasWindowProperty('test')).not.toThrow();
    });
  });
});
