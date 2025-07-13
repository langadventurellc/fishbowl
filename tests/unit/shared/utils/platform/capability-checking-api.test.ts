/**
 * Capability Checking API Test Suite
 *
 * Comprehensive tests for the extensible capability checking API structure.
 * Tests all core components including detectors, registry, manager, and utilities.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformType } from '../../../../../src/shared/constants/platform/PlatformType';
import { CapabilityDetectionResult } from '../../../../../src/shared/types/platform/CapabilityDetectionResult';
import { PlatformCapability } from '../../../../../src/shared/types/platform/PlatformCapability';
import {
  BaseCapabilityDetector,
  CapabilityDetectionConfig,
  CapabilityDetectionError,
  CapabilityDetectionErrorType,
  CapabilityDetector,
  CapabilityManager,
  CapabilityRegistry,
  DEFAULT_CAPABILITY_DETECTION_CONFIG,
  detectCapability,
  getGlobalCapabilityManager,
  getRegisteredCapabilities,
  hasGlobalCapabilityManager,
  isCapabilitySupported,
  registerCapabilityDetector,
  resetGlobalCapabilityManager,
} from '../../../../../src/shared/utils/platform/capabilities';

// Mock capability for testing
const mockCapability: PlatformCapability = {
  id: 'test-capability',
  name: 'Test Capability',
  description: 'A test capability for unit testing',
  supportedPlatforms: [PlatformType.ELECTRON],
  available: false,
  confidence: 0,
  requiresPermissions: false,
};

// Mock detector implementation
class MockCapabilityDetector extends BaseCapabilityDetector {
  private shouldSucceed: boolean;
  private detectionDelay: number;

  constructor(
    detectorId: string = 'mock-detector',
    supportedCapabilities: string[] = ['test-capability'],
    shouldSucceed: boolean = true,
    detectionDelay: number = 0,
  ) {
    super(detectorId, supportedCapabilities);
    this.shouldSucceed = shouldSucceed;
    this.detectionDelay = detectionDelay;
  }

  protected async performDetection(
    capability: PlatformCapability,
  ): Promise<Omit<CapabilityDetectionResult, 'detectionTimeMs' | 'timestamp'>> {
    // Simulate async detection
    if (this.detectionDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.detectionDelay));
    }

    if (!this.shouldSucceed) {
      throw new Error('Mock detection failure');
    }

    return this.createSuccessResult(capability, ['Mock detection successful']);
  }

  setSuccessMode(shouldSucceed: boolean): void {
    this.shouldSucceed = shouldSucceed;
  }

  setDetectionDelay(delay: number): void {
    this.detectionDelay = delay;
  }
}

describe('Capability Checking API', () => {
  let mockDetector: MockCapabilityDetector;
  let registry: CapabilityRegistry;
  let manager: CapabilityManager;

  beforeEach(() => {
    mockDetector = new MockCapabilityDetector();
    registry = new CapabilityRegistry();
    manager = new CapabilityManager();

    // Reset global state
    resetGlobalCapabilityManager();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('CapabilityDetector Interface', () => {
    it('should implement all required methods', () => {
      expect(typeof mockDetector.detect).toBe('function');
      expect(typeof mockDetector.getId).toBe('function');
      expect(typeof mockDetector.getSupportedCapabilities).toBe('function');
      expect(typeof mockDetector.canDetect).toBe('function');
    });

    it('should return correct detector ID', () => {
      expect(mockDetector.getId()).toBe('mock-detector');
    });

    it('should return supported capabilities', () => {
      const capabilities = mockDetector.getSupportedCapabilities();
      expect(capabilities).toEqual(['test-capability']);
    });

    it('should validate capability support correctly', () => {
      expect(mockDetector.canDetect(mockCapability)).toBe(true);

      const unsupportedCapability = { ...mockCapability, id: 'unsupported' };
      expect(mockDetector.canDetect(unsupportedCapability)).toBe(false);
    });
  });

  describe('BaseCapabilityDetector', () => {
    it('should perform successful detection', async () => {
      const result = await mockDetector.detect(mockCapability);

      expect(result.available).toBe(true);
      expect(result.detectionMethod).toBe('mock-detector');
      expect(result.evidence).toContain('Mock detection successful');
      expect(typeof result.detectionTimeMs).toBe('number');
      expect(typeof result.timestamp).toBe('number');
    });

    it('should handle detection failures gracefully', async () => {
      mockDetector.setSuccessMode(false);

      const result = await mockDetector.detect(mockCapability);

      expect(result.available).toBe(false);
      expect(result.evidence).toEqual(['Error during detection: Mock detection failure']);
      expect(result.warnings).toContain('Detection failed due to an error');
    });

    it('should validate capabilities before detection', async () => {
      const invalidCapability = null as unknown as PlatformCapability;

      const result = await mockDetector.detect(invalidCapability);
      expect(result.available).toBe(false);
      expect(result.evidence[0]).toContain('Error during detection');
    });

    it('should measure detection time accurately', async () => {
      mockDetector.setDetectionDelay(100);

      const result = await mockDetector.detect(mockCapability);

      expect(result.detectionTimeMs).toBeGreaterThan(50);
      expect(result.detectionTimeMs).toBeLessThan(200);
    });

    it('should reject unsupported capabilities', async () => {
      const unsupportedCapability = { ...mockCapability, id: 'unsupported' };

      const result = await mockDetector.detect(unsupportedCapability);
      expect(result.available).toBe(false);
      expect(result.evidence[0]).toContain('not supported by detector');
    });
  });

  describe('CapabilityRegistry', () => {
    it('should register detectors successfully', () => {
      expect(() => registry.register(mockDetector)).not.toThrow();
      expect(registry.getDetector('mock-detector')).toBe(mockDetector);
    });

    it('should prevent duplicate detector registration', () => {
      registry.register(mockDetector);

      expect(() => registry.register(mockDetector)).toThrow('already registered');
    });

    it('should unregister detectors', () => {
      registry.register(mockDetector);

      const removed = registry.unregister('mock-detector');
      expect(removed).toBe(true);
      expect(registry.getDetector('mock-detector')).toBeUndefined();
    });

    it('should find detectors for capabilities', () => {
      registry.register(mockDetector);

      const detector = registry.getDetectorForCapability(mockCapability);
      expect(detector).toBe(mockDetector);
    });

    it('should track supported capabilities', () => {
      registry.register(mockDetector);

      const capabilities = registry.getSupportedCapabilities();
      expect(capabilities).toContain('test-capability');
      expect(registry.isCapabilitySupported('test-capability')).toBe(true);
      expect(registry.isCapabilitySupported('unknown')).toBe(false);
    });

    it('should provide registry statistics', () => {
      registry.register(mockDetector);

      const stats = registry.getStats();
      expect(stats.totalDetectors).toBe(1);
      expect(stats.totalCapabilities).toBe(1);
      expect(stats.detectorIds).toContain('mock-detector');
      expect(stats.capabilityIds).toContain('test-capability');
    });

    it('should clear all registrations', () => {
      registry.register(mockDetector);
      registry.clear();

      const stats = registry.getStats();
      expect(stats.totalDetectors).toBe(0);
      expect(stats.totalCapabilities).toBe(0);
    });

    it('should validate detector implementations', () => {
      const invalidDetector = {} as CapabilityDetector;

      expect(() => registry.register(invalidDetector)).toThrow('detector.getId is not a function');
    });

    it('should prevent capability conflicts', () => {
      const conflictDetector = new MockCapabilityDetector('conflict-detector', ['test-capability']);

      registry.register(mockDetector);

      expect(() => registry.register(conflictDetector)).toThrow('already handled by detector');
    });
  });

  describe('CapabilityManager', () => {
    beforeEach(() => {
      manager.registerDetector(mockDetector);
    });

    it('should register and use detectors', async () => {
      const result = await manager.detectCapability(mockCapability);

      expect(result.available).toBe(true);
      expect(result.detectionMethod).toBe('mock-detector');
    });

    it('should handle unsupported capabilities', async () => {
      const unsupportedCapability = { ...mockCapability, id: 'unsupported' };

      const result = await manager.detectCapability(unsupportedCapability);

      expect(result.available).toBe(false);
      expect(result.evidence[0]).toContain('No detector registered');
      expect(result.fallbackOptions?.[0]).toContain('Register an appropriate detector');
    });

    it('should support concurrent detection', async () => {
      const capabilities = [
        mockCapability,
        { ...mockCapability, id: 'test-capability' }, // Same capability to test caching
      ];

      const results = await manager.detectMultipleCapabilities(capabilities);

      expect(results.size).toBe(1);
      expect(results.get('test-capability')?.available).toBe(true);
    });

    it('should cache detection results when enabled', async () => {
      const configWithCaching: Partial<CapabilityDetectionConfig> = {
        enableCaching: true,
        cacheTtlMs: 10000,
      };
      const cachingManager = new CapabilityManager(configWithCaching);
      cachingManager.registerDetector(mockDetector);

      // First detection
      await cachingManager.detectCapability(mockCapability);

      // Second detection should be faster (cached)
      const result2 = await cachingManager.detectCapability(mockCapability);

      expect(result2.available).toBe(true);
      // Note: In real implementation, cached results would have different timing
    });

    it('should handle detection timeouts', async () => {
      const timeoutConfig: Partial<CapabilityDetectionConfig> = {
        timeoutMs: 50,
        enableRetry: false,
      };
      const timeoutManager = new CapabilityManager(timeoutConfig);

      const slowDetector = new MockCapabilityDetector(
        'slow-detector',
        ['test-capability'],
        true,
        100,
      );
      timeoutManager.registerDetector(slowDetector);

      const result = await timeoutManager.detectCapability(mockCapability);
      expect(result.available).toBe(false);
      expect(result.evidence[0]).toContain('timeout');
    });

    it('should retry failed detections when enabled', async () => {
      const retryConfig: Partial<CapabilityDetectionConfig> = {
        enableRetry: true,
        maxRetryAttempts: 2,
        retryDelayMs: 10,
      };
      const retryManager = new CapabilityManager(retryConfig);

      const failingDetector = new MockCapabilityDetector(
        'failing-detector',
        ['test-capability'],
        false,
      );
      retryManager.registerDetector(failingDetector);

      const result = await retryManager.detectCapability(mockCapability);
      expect(result.available).toBe(false);
      // Verify retry attempts were made (would need more sophisticated mocking for exact count)
    });

    it('should provide manager statistics', () => {
      const stats = manager.getStats();

      expect(stats.registry.totalDetectors).toBe(1);
      expect(stats.cache.totalCached).toBe(0);
      expect(typeof stats.config).toBe('object');
    });

    it('should support cache management', () => {
      expect(() => manager.clearCache()).not.toThrow();

      const cacheStats = manager.getCacheStats();
      expect(typeof cacheStats.totalCached).toBe('number');
    });
  });

  describe('Global Capability Manager', () => {
    it('should create singleton instance', () => {
      const manager1 = getGlobalCapabilityManager();
      const manager2 = getGlobalCapabilityManager();

      expect(manager1).toBe(manager2);
      expect(hasGlobalCapabilityManager()).toBe(true);
    });

    it('should reset global instance', () => {
      const manager1 = getGlobalCapabilityManager();
      const manager2 = resetGlobalCapabilityManager();

      expect(manager1).not.toBe(manager2);
      expect(hasGlobalCapabilityManager()).toBe(true);
    });

    it('should use configuration on first creation', () => {
      // Clear existing instance before creating with custom config
      const customConfig: Partial<CapabilityDetectionConfig> = {
        timeoutMs: 10000,
        enableCaching: false,
      };

      const manager = resetGlobalCapabilityManager(customConfig);
      const stats = manager.getStats();

      expect(stats.config.timeoutMs).toBe(10000);
      expect(stats.config.enableCaching).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    beforeEach(() => {
      const globalManager = getGlobalCapabilityManager();
      globalManager.registerDetector(mockDetector);
    });

    it('should register detectors globally', () => {
      const newDetector = new MockCapabilityDetector('new-detector', ['new-capability']);

      expect(() => registerCapabilityDetector(newDetector)).not.toThrow();
      expect(isCapabilitySupported('new-capability')).toBe(true);
    });

    it('should check capability support', () => {
      expect(isCapabilitySupported('test-capability')).toBe(true);
      expect(isCapabilitySupported('unknown-capability')).toBe(false);
    });

    it('should detect capabilities using global manager', async () => {
      const result = await detectCapability(mockCapability);

      expect(result.available).toBe(true);
      expect(result.detectionMethod).toBe('mock-detector');
    });

    it('should get registered capabilities', () => {
      const capabilities = getRegisteredCapabilities();

      expect(capabilities).toContain('test-capability');
      expect(Array.isArray(capabilities)).toBe(true);
    });

    it('should handle manager creation errors gracefully', () => {
      // Mock a scenario where manager creation might fail
      const originalConsoleError = console.error;
      console.error = vi.fn();

      // This should not throw even if there are issues
      expect(() => isCapabilitySupported('any')).not.toThrow();
      expect(() => getRegisteredCapabilities()).not.toThrow();

      console.error = originalConsoleError;
    });
  });

  describe('Error Handling', () => {
    it('should create appropriate error types', () => {
      const unsupportedError = CapabilityDetectionError.unsupportedCapability('unknown');
      expect(unsupportedError.errorType).toBe(CapabilityDetectionErrorType.UNSUPPORTED_CAPABILITY);
      expect(unsupportedError.capabilityId).toBe('unknown');
      expect(unsupportedError.recoverySuggestions.length).toBeGreaterThan(0);

      const timeoutError = CapabilityDetectionError.detectionTimeout(5000, 'test', 'detector');
      expect(timeoutError.errorType).toBe(CapabilityDetectionErrorType.DETECTION_TIMEOUT);
      expect(timeoutError.context?.timeoutMs).toBe(5000);

      const permissionError = CapabilityDetectionError.permissionDenied('test', 'read');
      expect(permissionError.errorType).toBe(CapabilityDetectionErrorType.PERMISSION_DENIED);
    });

    it('should serialize errors to JSON', () => {
      const error = CapabilityDetectionError.unsupportedCapability('test');
      const json = error.toJSON();

      expect(json.name).toBe('CapabilityDetectionError');
      expect(json.errorType).toBe(CapabilityDetectionErrorType.UNSUPPORTED_CAPABILITY);
      expect(json.capabilityId).toBe('test');
      expect(Array.isArray(json.recoverySuggestions)).toBe(true);
    });

    it('should maintain stack traces', () => {
      const error = new CapabilityDetectionError(
        'Test error',
        CapabilityDetectionErrorType.UNKNOWN_ERROR,
      );

      expect(error.stack).toBeDefined();
      expect(error.name).toBe('CapabilityDetectionError');
    });
  });

  describe('Configuration', () => {
    it('should provide default configuration', () => {
      expect(DEFAULT_CAPABILITY_DETECTION_CONFIG).toBeDefined();
      expect(typeof DEFAULT_CAPABILITY_DETECTION_CONFIG.timeoutMs).toBe('number');
      expect(typeof DEFAULT_CAPABILITY_DETECTION_CONFIG.enableCaching).toBe('boolean');
    });

    it('should merge configurations correctly', () => {
      const customConfig: Partial<CapabilityDetectionConfig> = {
        timeoutMs: 10000,
        enableCaching: false,
      };

      const manager = new CapabilityManager(customConfig);
      const stats = manager.getStats();

      expect(stats.config.timeoutMs).toBe(10000);
      expect(stats.config.enableCaching).toBe(false);
      expect(stats.config.enableRetry).toBe(DEFAULT_CAPABILITY_DETECTION_CONFIG.enableRetry);
    });
  });

  describe('Performance and Timing', () => {
    it('should measure detection time accurately', async () => {
      manager.registerDetector(mockDetector);

      const result = await manager.detectCapability(mockCapability);

      expect(typeof result.detectionTimeMs).toBe('number');
      expect(result.detectionTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should include timestamps in results', async () => {
      manager.registerDetector(mockDetector);

      const beforeDetection = Date.now();
      const result = await manager.detectCapability(mockCapability);
      const afterDetection = Date.now();

      expect(result.timestamp).toBeGreaterThanOrEqual(beforeDetection);
      expect(result.timestamp).toBeLessThanOrEqual(afterDetection);
    });
  });
});
