/**
 * Tests for Secure Storage Capability Detection
 *
 * Validates secure storage capability detection across different platforms
 * and scenarios, ensuring proper integration with the capability framework.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformType } from '../../../../../src/shared/constants/platform/PlatformType';
import { PLATFORM_CAPABILITIES } from '../../../../../src/shared/constants/platform/PLATFORM_CAPABILITIES';
import { PlatformCapability } from '../../../../../src/shared/types/platform/PlatformCapability';
import {
  SecureStorageCapabilityDetector,
  hasSecureStorageCapability,
  resetGlobalCapabilityManager,
} from '../../../../../src/shared/utils/platform/capabilities';

// Mock platform detection
vi.mock('../../../../../src/shared/utils/platform/detectPlatformType', () => ({
  detectPlatformType: vi.fn(),
}));

import * as detectPlatformTypeModule from '../../../../../src/shared/utils/platform/detectPlatformType';
const { detectPlatformType } = vi.mocked(detectPlatformTypeModule);

describe('SecureStorageCapabilityDetector', () => {
  let detector: SecureStorageCapabilityDetector;
  let testCapability: PlatformCapability;

  beforeEach(() => {
    detector = new SecureStorageCapabilityDetector();
    testCapability = {
      id: PLATFORM_CAPABILITIES.SECURE_STORAGE,
      name: 'Secure Storage',
      description: 'Test secure storage capability',
      supportedPlatforms: [PlatformType.ELECTRON],
      available: false,
      confidence: 0,
      requiresPermissions: true,
    };

    // Reset mocks
    vi.clearAllMocks();
    resetGlobalCapabilityManager();

    // Setup global mocks
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true,
    });
    Object.defineProperty(global, 'performance', {
      value: { now: vi.fn(() => Date.now()) },
      writable: true,
    });
  });

  describe('Detector Configuration', () => {
    it('should have correct detector ID', () => {
      expect(detector.getId()).toBe('secure-storage-detector');
    });

    it('should support secure storage capability', () => {
      const supportedCapabilities = detector.getSupportedCapabilities();
      expect(supportedCapabilities).toContain(PLATFORM_CAPABILITIES.SECURE_STORAGE);
    });

    it('should be able to detect secure storage capability', () => {
      expect(detector.canDetect(testCapability)).toBe(true);
    });

    it('should not be able to detect unsupported capabilities', () => {
      const unsupportedCapability = {
        ...testCapability,
        id: 'unsupported-capability',
      };
      expect(detector.canDetect(unsupportedCapability)).toBe(false);
    });
  });

  describe('Electron Platform Detection', () => {
    beforeEach(() => {
      vi.mocked(detectPlatformType).mockReturnValue(PlatformType.ELECTRON);
    });

    it('should detect secure storage as available when Electron API is properly configured', async () => {
      // Mock complete Electron environment with secure storage API
      Object.defineProperty(global, 'window', {
        value: {
          electronAPI: {
            secureStorage: {
              secureKeytarGet: vi.fn(),
              secureKeytarSet: vi.fn(),
              secureKeytarDelete: vi.fn(),
              secureCredentialsGet: vi.fn(),
              secureCredentialsSet: vi.fn(),
              secureCredentialsDelete: vi.fn(),
            },
          },
        },
        writable: true,
      });

      const result = await detector.detect(testCapability);

      expect(result.available).toBe(true);
      expect(result.evidence).toContain('Electron environment detected');
      expect(result.evidence).toContain('Secure storage IPC interface available');
      expect(result.evidence).toContain('All required secure storage methods present');
      expect(result.requiredPermissions).toContain('keytar');
      expect(result.permissionsGranted).toBe(true);
    });

    it('should fail when not in Electron environment (no window)', async () => {
      // Keep window undefined
      const result = await detector.detect(testCapability);

      expect(result.available).toBe(false);
      expect(result.evidence[0]).toContain('Not running in Electron environment');
      expect(result.fallbackOptions).toContain('Ensure application is running as Electron app');
    });

    it('should fail when electronAPI is not available', async () => {
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      });

      const result = await detector.detect(testCapability);

      expect(result.available).toBe(false);
      expect(result.evidence[0]).toContain('Not running in Electron environment');
    });

    it('should fail when secureStorage interface is missing', async () => {
      Object.defineProperty(global, 'window', {
        value: {
          electronAPI: {
            // Missing secureStorage interface
          },
        },
        writable: true,
      });

      const result = await detector.detect(testCapability);

      expect(result.available).toBe(false);
      expect(result.evidence[0]).toContain('Secure storage IPC interface not available');
      expect(result.fallbackOptions).toContain(
        'Ensure preload script includes secure storage methods',
      );
    });

    it('should fail when secure storage methods are incomplete', async () => {
      Object.defineProperty(global, 'window', {
        value: {
          electronAPI: {
            secureStorage: {
              secureKeytarGet: vi.fn(),
              // Missing other required methods
            },
          },
        },
        writable: true,
      });

      const result = await detector.detect(testCapability);

      expect(result.available).toBe(false);
      expect(result.evidence[0]).toContain('Secure storage API methods not available');
      expect(result.fallbackOptions).toContain(
        'Ensure all secure storage IPC methods are exposed in preload script',
      );
    });

    it('should handle detection errors gracefully', async () => {
      Object.defineProperty(global, 'window', {
        value: {
          get electronAPI() {
            throw new Error('Access denied');
          },
        },
        writable: true,
      });

      const result = await detector.detect(testCapability);

      expect(result.available).toBe(false);
      expect(result.evidence[0]).toContain('Secure storage detection failed: Access denied');
      expect(result.fallbackOptions).toContain('Check Electron setup and keytar installation');
    });
  });

  describe('Web Platform Detection', () => {
    beforeEach(() => {
      vi.mocked(detectPlatformType).mockReturnValue(PlatformType.WEB);
    });

    it('should mark secure storage as unavailable on web platform', async () => {
      const result = await detector.detect(testCapability);

      expect(result.available).toBe(false);
      expect(result.evidence[0]).toContain('Secure storage not available in web environment');
      expect(result.fallbackOptions).toContain('Use browser localStorage (less secure)');
      expect(result.fallbackOptions).toContain('Implement server-side credential storage');
    });
  });

  describe('Capacitor Platform Detection', () => {
    beforeEach(() => {
      vi.mocked(detectPlatformType).mockReturnValue(PlatformType.CAPACITOR);
    });

    it('should mark secure storage as unavailable on Capacitor platform (not yet implemented)', async () => {
      const result = await detector.detect(testCapability);

      expect(result.available).toBe(false);
      expect(result.evidence[0]).toContain('Capacitor secure storage not yet implemented');
      expect(result.fallbackOptions).toContain(
        'Plan for iOS Keychain and Android Keystore integration',
      );
    });
  });

  describe('Unknown Platform Detection', () => {
    beforeEach(() => {
      vi.mocked(detectPlatformType).mockReturnValue(PlatformType.UNKNOWN);
    });

    it('should mark secure storage as unavailable on unknown platform', async () => {
      const result = await detector.detect(testCapability);

      expect(result.available).toBe(false);
      expect(result.evidence[0]).toContain(
        'Cannot determine secure storage availability on unknown platform',
      );
      expect(result.fallbackOptions).toContain('Ensure platform detection is working correctly');
    });
  });

  describe('Capability Validation', () => {
    it('should handle invalid capability gracefully', async () => {
      const invalidCapability = null as unknown as PlatformCapability;

      const result = await detector.detect(invalidCapability);

      expect(result.available).toBe(false);
      expect(result.evidence[0]).toContain(
        'Error during detection: Invalid capability: must be an object',
      );
      expect(result.fallbackOptions).toContain('Assume capability is unavailable');
    });

    it('should handle invalid capability ID gracefully', async () => {
      const invalidCapability = {
        ...testCapability,
        id: '',
      };

      const result = await detector.detect(invalidCapability);

      expect(result.available).toBe(false);
      expect(result.evidence[0]).toContain(
        'Error during detection: Invalid capability: id must be a non-empty string',
      );
      expect(result.fallbackOptions).toContain('Assume capability is unavailable');
    });

    it('should handle unsupported capability gracefully', async () => {
      const unsupportedCapability = {
        ...testCapability,
        id: 'unsupported-capability',
      };

      const result = await detector.detect(unsupportedCapability);

      expect(result.available).toBe(false);
      expect(result.evidence[0]).toContain(
        "Error during detection: Capability 'unsupported-capability' is not supported by detector 'secure-storage-detector'",
      );
      expect(result.fallbackOptions).toContain('Assume capability is unavailable');
    });
  });

  describe('Detection Result Properties', () => {
    beforeEach(() => {
      vi.mocked(detectPlatformType).mockReturnValue(PlatformType.WEB);
    });

    it('should include timing information in detection results', async () => {
      const mockPerformanceNow = vi
        .fn()
        .mockReturnValueOnce(100) // Start time
        .mockReturnValueOnce(105); // End time
      Object.defineProperty(global, 'performance', {
        value: { now: mockPerformanceNow },
        writable: true,
      });

      const result = await detector.detect(testCapability);

      expect(result.detectionTimeMs).toBe(5);
      expect(result.timestamp).toBeTypeOf('number');
      expect(result.detectionMethod).toBe('secure-storage-detector');
    });

    it('should include capability in detection results', async () => {
      const result = await detector.detect(testCapability);

      expect(result.capability).toEqual(testCapability);
    });
  });
});

describe('hasSecureStorageCapability', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset platform detection mock to default before each test
    vi.mocked(detectPlatformType).mockReturnValue(PlatformType.WEB);

    resetGlobalCapabilityManager();

    // Setup basic window mock
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true,
    });
    Object.defineProperty(global, 'performance', {
      value: { now: vi.fn(() => Date.now()) },
      writable: true,
    });
  });

  it('should return true when secure storage is available (Electron)', async () => {
    vi.mocked(detectPlatformType).mockReturnValue(PlatformType.ELECTRON);

    // Mock complete Electron environment
    Object.defineProperty(global, 'window', {
      value: {
        electronAPI: {
          secureStorage: {
            secureKeytarGet: vi.fn(),
            secureKeytarSet: vi.fn(),
            secureKeytarDelete: vi.fn(),
            secureCredentialsGet: vi.fn(),
            secureCredentialsSet: vi.fn(),
            secureCredentialsDelete: vi.fn(),
          },
        },
      },
      writable: true,
    });

    const result = await hasSecureStorageCapability();
    expect(result).toBe(true);
  });

  it('should return false when secure storage is not available (Web)', async () => {
    vi.mocked(detectPlatformType).mockReturnValue(PlatformType.WEB);

    const result = await hasSecureStorageCapability();
    expect(result).toBe(false);
  });

  it('should handle errors gracefully and return false', async () => {
    // Create a fresh capability manager instance to avoid affecting other tests
    resetGlobalCapabilityManager();

    vi.mocked(detectPlatformType).mockImplementation(() => {
      throw new Error('Platform detection failed');
    });

    const result = await hasSecureStorageCapability();
    expect(result).toBe(false);

    // Reset to working state for subsequent tests
    vi.mocked(detectPlatformType).mockReturnValue(PlatformType.WEB);
  });

  it('should register the detector automatically', async () => {
    vi.mocked(detectPlatformType).mockReturnValue(PlatformType.WEB);

    // Multiple calls should work without issues
    await hasSecureStorageCapability();
    await hasSecureStorageCapability();

    // Should not throw errors about duplicate registration
    expect(true).toBe(true); // Test passes if no errors thrown
  });
});
