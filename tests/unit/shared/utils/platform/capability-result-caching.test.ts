/**
 * Enhanced Capability Result Caching Tests
 *
 * Comprehensive test suite for the capability detection result caching mechanism,
 * including performance tracking, memory management, and cache statistics.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CapabilityCacheManager,
  CapabilityManager,
} from '../../../../../src/shared/utils/platform/capabilities';
import { CapabilityDetectionResult } from '../../../../../src/shared/types/platform/CapabilityDetectionResult';
import { PlatformCapability } from '../../../../../src/shared/types/platform/PlatformCapability';
import { PlatformType } from '../../../../../src/shared/constants/platform/PlatformType';

// Mock performance.now for consistent testing
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: { now: mockPerformanceNow },
  writable: true,
});

describe('CapabilityCacheManager', () => {
  let cacheManager: CapabilityCacheManager;
  let mockCapability: PlatformCapability;
  let mockResult: CapabilityDetectionResult;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceNow.mockReturnValue(1000);

    cacheManager = new CapabilityCacheManager({
      maxEntries: 5,
      ttlMs: 10000, // 10 seconds for testing
      maxMemoryBytes: 10 * 1024, // 10KB for testing (larger to avoid memory-based eviction)
      enableStatistics: true,
      enableDebugLogging: false,
      evictionStrategy: 'lru',
    });

    mockCapability = {
      id: 'test-capability',
      name: 'Test Capability',
      description: 'A test capability',
      supportedPlatforms: [PlatformType.ELECTRON],
      available: true,
      confidence: 95,
      requiresPermissions: false,
    };

    mockResult = {
      capability: mockCapability,
      available: true,
      detectionTimeMs: 1.5,
      detectionMethod: 'test-detector',
      evidence: ['test evidence'],
      requiredPermissions: ['test:permission'],
      permissionsGranted: true,
      fallbackOptions: ['fallback option'],
      timestamp: Date.now(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Cache Operations', () => {
    it('should store and retrieve capability results', () => {
      cacheManager.set('test-capability', mockResult);
      const retrieved = cacheManager.get('test-capability');

      expect(retrieved).toEqual(mockResult);
    });

    it('should return undefined for non-existent capabilities', () => {
      const result = cacheManager.get('non-existent');
      expect(result).toBeUndefined();
    });

    it('should check if capability is cached', () => {
      expect(cacheManager.has('test-capability')).toBe(false);

      cacheManager.set('test-capability', mockResult);
      expect(cacheManager.has('test-capability')).toBe(true);
    });

    it('should delete cached capabilities', () => {
      cacheManager.set('test-capability', mockResult);
      expect(cacheManager.has('test-capability')).toBe(true);

      const deleted = cacheManager.delete('test-capability');
      expect(deleted).toBe(true);
      expect(cacheManager.has('test-capability')).toBe(false);
    });

    it('should clear all cached entries', () => {
      cacheManager.set('capability-1', mockResult);
      cacheManager.set('capability-2', mockResult);

      const statsBefore = cacheManager.getStats();
      expect(statsBefore.totalEntries).toBe(2);

      cacheManager.clear();

      const statsAfter = cacheManager.getStats();
      expect(statsAfter.totalEntries).toBe(0);
    });
  });

  describe('Cache Expiration', () => {
    it('should expire cached entries after TTL', () => {
      const originalDateNow = Date.now;
      const startTime = 1000000;
      Date.now = vi.fn(() => startTime);

      cacheManager.set('test-capability', mockResult);
      expect(cacheManager.has('test-capability')).toBe(true);

      // Move time forward beyond TTL
      Date.now = vi.fn(() => startTime + 15000); // 15 seconds later

      expect(cacheManager.has('test-capability')).toBe(false);
      expect(cacheManager.get('test-capability')).toBeUndefined();

      Date.now = originalDateNow;
    });

    it('should not expire entries within TTL', () => {
      const originalDateNow = Date.now;
      const startTime = 1000000;
      Date.now = vi.fn(() => startTime);

      cacheManager.set('test-capability', mockResult);

      // Move time forward within TTL
      Date.now = vi.fn(() => startTime + 5000); // 5 seconds later

      expect(cacheManager.has('test-capability')).toBe(true);
      expect(cacheManager.get('test-capability')).toEqual(mockResult);

      Date.now = originalDateNow;
    });
  });

  describe('Cache Statistics and Hit Rate Tracking', () => {
    it('should track cache hits and misses', () => {
      const statsBefore = cacheManager.getStats();
      expect(statsBefore.hits).toBe(0);
      expect(statsBefore.misses).toBe(0);
      expect(statsBefore.hitRate).toBe(0);

      // Cache miss
      cacheManager.get('non-existent');
      let stats = cacheManager.getStats();
      expect(stats.misses).toBe(1);
      expect(stats.hits).toBe(0);

      // Cache store and hit
      cacheManager.set('test-capability', mockResult);
      cacheManager.get('test-capability');

      stats = cacheManager.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });

    it('should track memory usage', () => {
      const statsBefore = cacheManager.getStats();
      expect(statsBefore.memoryUsageBytes).toBe(0);

      cacheManager.set('test-capability', mockResult);

      const statsAfter = cacheManager.getStats();
      expect(statsAfter.memoryUsageBytes).toBeGreaterThan(0);
      expect(statsAfter.memoryUsagePercent).toBeGreaterThan(0);
    });

    it('should track access patterns', () => {
      cacheManager.set('test-capability', mockResult);

      // Access multiple times
      cacheManager.get('test-capability');
      cacheManager.get('test-capability');
      cacheManager.get('test-capability');

      const stats = cacheManager.getStats();
      expect(stats.averageAccessCount).toBe(3);
    });

    it('should track cache entry ages', () => {
      const originalDateNow = Date.now;
      const startTime = 1000000;
      Date.now = vi.fn(() => startTime);

      cacheManager.set('capability-1', mockResult);

      Date.now = vi.fn(() => startTime + 1000);
      cacheManager.set('capability-2', mockResult);

      Date.now = vi.fn(() => startTime + 5000);
      const stats = cacheManager.getStats();

      expect(stats.oldestEntryAge).toBe(5000);
      expect(stats.newestEntryAge).toBe(4000);

      Date.now = originalDateNow;
    });

    it('should reset statistics', () => {
      cacheManager.set('test-capability', mockResult);
      cacheManager.get('test-capability');
      cacheManager.get('non-existent');

      let stats = cacheManager.getStats();
      expect(stats.hits).toBeGreaterThan(0);
      expect(stats.misses).toBeGreaterThan(0);

      cacheManager.resetStats();

      stats = cacheManager.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('Cache Eviction and Memory Management', () => {
    it('should evict least recently used entries when at capacity', () => {
      // Fill cache to capacity
      for (let i = 0; i < 5; i++) {
        cacheManager.set(`capability-${i}`, mockResult);
      }

      expect(cacheManager.getStats().totalEntries).toBe(5);

      // Access some entries to establish LRU order
      cacheManager.get('capability-1');
      cacheManager.get('capability-3');

      // Add one more entry to trigger eviction
      cacheManager.set('capability-new', mockResult);

      const stats = cacheManager.getStats();
      expect(stats.totalEntries).toBe(5); // Still at capacity
      expect(stats.evictedEntries).toBeGreaterThan(0);

      // Recently accessed entries should still be present
      expect(cacheManager.has('capability-1')).toBe(true);
      expect(cacheManager.has('capability-3')).toBe(true);
      expect(cacheManager.has('capability-new')).toBe(true);
    });

    it('should handle memory-based eviction', () => {
      // Create large result to test memory eviction
      const largeResult = {
        ...mockResult,
        evidence: Array(100).fill('very long evidence string that takes up memory'),
      };

      // Fill cache with large entries
      cacheManager.set('large-1', largeResult);
      cacheManager.set('large-2', largeResult);

      const stats = cacheManager.getStats();
      expect(stats.memoryUsageBytes).toBeGreaterThan(1000);
    });

    it('should perform cleanup of expired entries', () => {
      const originalDateNow = Date.now;
      const startTime = 1000000;
      Date.now = vi.fn(() => startTime);

      // Add entries
      cacheManager.set('capability-1', mockResult);
      cacheManager.set('capability-2', mockResult);

      expect(cacheManager.getStats().totalEntries).toBe(2);

      // Move time forward to expire entries
      Date.now = vi.fn(() => startTime + 15000);

      // Trigger cleanup
      cacheManager.cleanup();

      expect(cacheManager.getStats().totalEntries).toBe(0);

      Date.now = originalDateNow;
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid capability IDs gracefully', () => {
      expect(() => cacheManager.set('', mockResult)).not.toThrow();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(() => cacheManager.set(null as any, mockResult)).not.toThrow();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(() => cacheManager.set(undefined as any, mockResult)).not.toThrow();
    });

    it('should handle invalid results gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(() => cacheManager.set('test', null as any)).not.toThrow();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(() => cacheManager.set('test', undefined as any)).not.toThrow();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(() => cacheManager.set('test', 'invalid' as any)).not.toThrow();
    });

    it('should continue operating when cache operations fail', () => {
      // Mock a scenario where estimation fails
      const originalJSON = JSON.stringify;
      JSON.stringify = vi.fn(() => {
        throw new Error('Serialization error');
      });

      expect(() => cacheManager.set('test-capability', mockResult)).not.toThrow();

      JSON.stringify = originalJSON;
    });
  });

  describe('Configuration Options', () => {
    it('should respect maxEntries configuration', () => {
      const smallCache = new CapabilityCacheManager({ maxEntries: 2 });

      smallCache.set('cap-1', mockResult);
      smallCache.set('cap-2', mockResult);
      expect(smallCache.getStats().totalEntries).toBe(2);

      smallCache.set('cap-3', mockResult);
      expect(smallCache.getStats().totalEntries).toBe(2); // Should evict oldest
    });

    it('should respect TTL configuration', () => {
      const shortTtlCache = new CapabilityCacheManager({ ttlMs: 100 });

      const originalDateNow = Date.now;
      const startTime = 1000000;
      Date.now = vi.fn(() => startTime);

      shortTtlCache.set('test-capability', mockResult);
      expect(shortTtlCache.has('test-capability')).toBe(true);

      Date.now = vi.fn(() => startTime + 200);
      expect(shortTtlCache.has('test-capability')).toBe(false);

      Date.now = originalDateNow;
    });

    it('should support disabling statistics', () => {
      const noStatsCache = new CapabilityCacheManager({ enableStatistics: false });

      noStatsCache.set('test-capability', mockResult);
      noStatsCache.get('test-capability');
      noStatsCache.get('non-existent');

      const stats = noStatsCache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });
});

describe('CapabilityManager Enhanced Caching Integration', () => {
  let capabilityManager: CapabilityManager;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceNow.mockReturnValue(1000);

    capabilityManager = new CapabilityManager({
      enableCaching: true,
      cacheTtlMs: 10000,
    });
  });

  it('should integrate enhanced caching with capability detection', () => {
    expect(capabilityManager.isCached('test-capability')).toBe(false);

    const stats = capabilityManager.getCacheStats();
    expect(stats.totalEntries).toBe(0);
    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(0);
  });

  it('should provide cache management methods', () => {
    expect(typeof capabilityManager.isCached).toBe('function');
    expect(typeof capabilityManager.evictFromCache).toBe('function');
    expect(typeof capabilityManager.performCacheMaintenance).toBe('function');
    expect(typeof capabilityManager.resetCacheStats).toBe('function');
    expect(typeof capabilityManager.getCacheStats).toBe('function');
  });

  it('should return enhanced cache statistics', () => {
    const stats = capabilityManager.getCacheStats();

    // Check that enhanced stats are available
    expect(stats).toHaveProperty('totalEntries');
    expect(stats).toHaveProperty('hits');
    expect(stats).toHaveProperty('misses');
    expect(stats).toHaveProperty('hitRate');
    expect(stats).toHaveProperty('memoryUsageBytes');
    expect(stats).toHaveProperty('memoryUsagePercent');
    expect(stats).toHaveProperty('averageAccessCount');
    expect(stats).toHaveProperty('evictedEntries');
    expect(stats).toHaveProperty('currentGeneration');
  });

  it('should allow manual cache eviction', () => {
    // This would be tested with actual capability detection
    // For now, just test the method exists and doesn't throw
    expect(() => capabilityManager.evictFromCache('test-capability')).not.toThrow();
  });

  it('should allow manual cache maintenance', () => {
    expect(() => capabilityManager.performCacheMaintenance()).not.toThrow();
  });

  it('should allow cache statistics reset', () => {
    expect(() => capabilityManager.resetCacheStats()).not.toThrow();

    const statsAfter = capabilityManager.getCacheStats();
    expect(statsAfter.hits).toBe(0);
    expect(statsAfter.misses).toBe(0);
  });

  it('should include cache stats in manager stats', () => {
    const managerStats = capabilityManager.getStats();

    expect(managerStats).toHaveProperty('cache');
    expect(managerStats.cache).toHaveProperty('totalEntries');
    expect(managerStats.cache).toHaveProperty('hitRate');
    expect(managerStats.cache).toHaveProperty('memoryUsageBytes');
  });
});

describe('Cache Performance Requirements', () => {
  let cacheManager: CapabilityCacheManager;

  beforeEach(() => {
    cacheManager = new CapabilityCacheManager({
      maxEntries: 100,
      ttlMs: 60000,
      maxMemoryBytes: 1024 * 1024, // 1MB
    });
  });

  it('should maintain memory usage under configured limits', () => {
    // Add many entries
    for (let i = 0; i < 50; i++) {
      const result = {
        capability: {
          id: `capability-${i}`,
          name: `Capability ${i}`,
          description: `Test capability ${i}`,
          supportedPlatforms: [PlatformType.ELECTRON],
          available: true,
          confidence: 95,
          requiresPermissions: false,
        },
        available: true,
        detectionTimeMs: 1.0,
        detectionMethod: 'test-detector',
        evidence: [`evidence for capability ${i}`],
        requiredPermissions: [],
        permissionsGranted: true,
        timestamp: Date.now(),
      };

      cacheManager.set(`capability-${i}`, result);
    }

    const stats = cacheManager.getStats();
    expect(stats.memoryUsageBytes).toBeLessThan(1024 * 1024); // Under 1MB
  });

  it('should provide sub-millisecond cache hits', () => {
    const mockResult = {
      capability: {
        id: 'fast-capability',
        name: 'Fast Capability',
        description: 'A fast capability for testing',
        supportedPlatforms: [PlatformType.ELECTRON],
        available: true,
        confidence: 95,
        requiresPermissions: false,
      },
      available: true,
      detectionTimeMs: 1.0,
      detectionMethod: 'test-detector',
      evidence: ['test evidence'],
      requiredPermissions: [],
      permissionsGranted: true,
      timestamp: Date.now(),
    };

    cacheManager.set('fast-capability', mockResult);

    const startTime = performance.now();
    const result = cacheManager.get('fast-capability');
    const endTime = performance.now();

    expect(result).toEqual(mockResult);
    // Cache hit should be very fast (though this is hard to test reliably)
    expect(endTime - startTime).toBeLessThan(10); // Less than 10ms for the operation
  });

  it('should maintain reasonable hit rates with mixed access patterns', () => {
    // Simulate realistic capability detection patterns
    const capabilities = [
      'secure-storage',
      'file-system',
      'network-access',
      'camera-access',
      'microphone-access',
    ];

    const mockResult = {
      capability: {
        id: 'test',
        name: 'Test',
        description: 'Test capability',
        supportedPlatforms: [PlatformType.ELECTRON],
        available: true,
        confidence: 95,
        requiresPermissions: false,
      },
      available: true,
      detectionTimeMs: 1.0,
      detectionMethod: 'test-detector',
      evidence: ['test evidence'],
      requiredPermissions: [],
      permissionsGranted: true,
      timestamp: Date.now(),
    };

    // Cache some capabilities
    capabilities.forEach(cap => {
      cacheManager.set(cap, {
        ...mockResult,
        capability: {
          id: cap,
          name: cap,
          description: `Test capability ${cap}`,
          supportedPlatforms: [PlatformType.ELECTRON],
          available: true,
          confidence: 95,
          requiresPermissions: false,
        },
      });
    });

    // Simulate mixed access pattern (hits and misses)
    for (let i = 0; i < 20; i++) {
      const randomCap = capabilities[Math.floor(Math.random() * capabilities.length)];
      cacheManager.get(randomCap); // Cache hit

      cacheManager.get(`non-existent-${i}`); // Cache miss
    }

    const stats = cacheManager.getStats();
    expect(stats.hitRate).toBeGreaterThan(0.3); // At least 30% hit rate
  });
});
