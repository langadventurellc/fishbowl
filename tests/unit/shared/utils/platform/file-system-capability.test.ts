/**
 * Tests for File System Capability Detection
 *
 * Comprehensive test suite covering FileSystemCapabilityDetector and hasFileSystemCapability
 * utility function across all platform environments with error handling and edge cases.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FileSystemCapabilityDetector } from '../../../../../src/shared/utils/platform/capabilities/FileSystemCapabilityDetector';
import { hasFileSystemCapability } from '../../../../../src/shared/utils/platform/capabilities/hasFileSystemCapability';
import { PLATFORM_CAPABILITIES } from '../../../../../src/shared/constants/platform/PLATFORM_CAPABILITIES';
import { PlatformType } from '../../../../../src/shared/constants/platform/PlatformType';
import { PlatformCapability } from '../../../../../src/shared/types/platform/PlatformCapability';
import { resetGlobalCapabilityManager } from '../../../../../src/shared/utils/platform/capabilities/capabilityManager/resetGlobalCapabilityManager';

// Mock platform detection
vi.mock('../../../../../src/shared/utils/platform/detectPlatformType', () => ({
  detectPlatformType: vi.fn(),
}));

import * as detectPlatformTypeModule from '../../../../../src/shared/utils/platform/detectPlatformType';
const { detectPlatformType } = vi.mocked(detectPlatformTypeModule);

describe('FileSystemCapabilityDetector', () => {
  let detector: FileSystemCapabilityDetector;
  let testCapability: PlatformCapability;

  beforeEach(() => {
    detector = new FileSystemCapabilityDetector();
    testCapability = {
      id: PLATFORM_CAPABILITIES.FILE_SYSTEM_ACCESS,
      name: 'File System Access',
      description: 'Test file system capability',
      supportedPlatforms: [PlatformType.ELECTRON, PlatformType.WEB, PlatformType.CAPACITOR],
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
    Object.defineProperty(global, 'navigator', {
      value: undefined,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Detector Configuration', () => {
    it('should have correct detector ID', () => {
      expect(detector.getId()).toBe('FileSystemCapabilityDetector');
    });

    it('should support FILE_SYSTEM_ACCESS capability', () => {
      const capabilities = detector.getSupportedCapabilities();
      expect(capabilities).toContain(PLATFORM_CAPABILITIES.FILE_SYSTEM_ACCESS);
      expect(capabilities).toHaveLength(1);
    });

    it('should be able to detect file system capability', () => {
      expect(detector.canDetect(testCapability)).toBe(true);
    });
  });

  describe('Electron Platform Detection', () => {
    beforeEach(() => {
      detectPlatformType.mockReturnValue(PlatformType.ELECTRON);

      // Mock Electron environment
      Object.defineProperty(global, 'window', {
        value: {
          electronAPI: {},
        },
        writable: true,
      });
    });

    it('should detect file system capability when IPC methods are available', async () => {
      // Mock electronAPI with file system methods
      (globalThis.window as any).electronAPI = {
        readFile: vi.fn(),
        writeFile: vi.fn(),
        deleteFile: vi.fn(),
        watchFile: vi.fn(),
      };

      const result = await detector.detect(testCapability);

      expect(result.available).toBe(true);
      expect(result.evidence).toContain('Electron file system API available via IPC');
      expect(result.evidence).toContain('Platform: Electron');
      expect(result.evidence).toContain('Access method: IPC');
    });

    it('should detect file system capability with filesystem namespace', async () => {
      // Mock electronAPI with filesystem namespace
      (globalThis.window as any).electronAPI = {
        filesystem: {
          read: vi.fn(),
          write: vi.fn(),
        },
      };

      const result = await detector.detect(testCapability);

      expect(result.available).toBe(true);
    });

    it('should report unavailable when electronAPI exists but no file system methods', async () => {
      // Mock electronAPI without file system methods
      (globalThis.window as any).electronAPI = {
        systemInfo: vi.fn(),
        openExternal: vi.fn(),
      };

      const result = await detector.detect(testCapability);

      expect(result.available).toBe(false);
      expect(result.fallbackOptions).toContain(
        'Implement file system IPC handlers in main process',
      );
    });

    it('should report unavailable when electronAPI is not exposed', async () => {
      // Remove electronAPI from window
      delete (globalThis.window as any).electronAPI;

      const result = await detector.detect(testCapability);

      expect(result.available).toBe(false);
      expect(result.fallbackOptions).toContain(
        'Configure context bridge to expose file system APIs',
      );
    });
  });

  describe('Web Platform Detection', () => {
    beforeEach(() => {
      detectPlatformType.mockReturnValue(PlatformType.WEB);

      // Mock Web environment
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      });
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
      });
    });

    it('should detect File System Access API capability', async () => {
      // Mock File System Access API
      (globalThis.window as any).showOpenFilePicker = vi.fn();
      (globalThis.window as any).showSaveFilePicker = vi.fn();

      const result = await detector.detect(testCapability);

      expect(result.available).toBe(true);
      expect(result.evidence).toContain('File System Access API available');
      expect(result.evidence).toContain('Platform: Web');
    });

    it('should detect OPFS capability', async () => {
      // Mock OPFS
      (globalThis.navigator as any).storage = {
        getDirectory: vi.fn(),
      };

      const result = await detector.detect(testCapability);

      expect(result.available).toBe(true);
      expect(result.evidence).toContain('Origin Private File System (OPFS) available');
      expect(result.evidence).toContain('Performance: high-performance OPFS available');
    });

    it('should report not supported when no file system APIs available', async () => {
      // No file system APIs available (default mock web environment)
      const result = await detector.detect(testCapability);

      expect(result.available).toBe(false);
      expect(result.fallbackOptions).toContain(
        'Use modern browser with File System Access API support',
      );
    });
  });

  describe('Capacitor Platform Detection', () => {
    beforeEach(() => {
      detectPlatformType.mockReturnValue(PlatformType.CAPACITOR);

      // Mock Capacitor environment
      Object.defineProperty(global, 'window', {
        value: {
          Capacitor: {},
        },
        writable: true,
      });
    });

    it('should detect Filesystem plugin capability', async () => {
      // Mock Capacitor with Filesystem plugin
      (globalThis.window as any).Capacitor = {
        Plugins: {
          Filesystem: {
            version: '7.1.1',
            readFile: vi.fn(),
            writeFile: vi.fn(),
          },
        },
      };

      const result = await detector.detect(testCapability);

      expect(result.available).toBe(true);
      expect(result.evidence).toContain('Capacitor Filesystem plugin available');
      expect(result.evidence).toContain('Platform: Capacitor');
      expect(result.evidence).toContain('Plugin version: 7.1.1');
    });

    it('should detect capability with isPluginAvailable method', async () => {
      // Mock Capacitor with isPluginAvailable method
      (globalThis.window as any).Capacitor = {
        isPluginAvailable: vi.fn().mockImplementation(plugin => plugin === 'Filesystem'),
      };

      const result = await detector.detect(testCapability);

      expect(result.available).toBe(true);
      expect((globalThis.window as any).Capacitor.isPluginAvailable).toHaveBeenCalledWith(
        'Filesystem',
      );
    });

    it('should report unavailable when Filesystem plugin not available', async () => {
      // Mock Capacitor without Filesystem plugin
      (globalThis.window as any).Capacitor = {
        Plugins: {},
      };

      const result = await detector.detect(testCapability);

      expect(result.available).toBe(false);
      expect(result.fallbackOptions).toContain(
        'Install and configure @capacitor/filesystem plugin',
      );
    });
  });

  describe('Unknown Platform Detection', () => {
    beforeEach(() => {
      detectPlatformType.mockReturnValue(PlatformType.UNKNOWN);
    });

    it('should report not supported for unknown platform', async () => {
      const result = await detector.detect(testCapability);

      expect(result.available).toBe(false);
      expect(result.fallbackOptions).toContain(
        'Use a supported platform (Electron, Web, or Capacitor)',
      );
    });
  });

  describe('Detection Result Properties', () => {
    beforeEach(() => {
      detectPlatformType.mockReturnValue(PlatformType.ELECTRON);
      Object.defineProperty(global, 'window', {
        value: {
          electronAPI: { readFile: vi.fn() },
        },
        writable: true,
      });
    });

    it('should include required result properties', async () => {
      const result = await detector.detect(testCapability);

      expect(result).toHaveProperty('capability');
      expect(result).toHaveProperty('available');
      expect(result).toHaveProperty('detectionMethod');
      expect(result).toHaveProperty('evidence');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('detectionTimeMs');
      expect(typeof result.timestamp).toBe('number');
      expect(typeof result.detectionTimeMs).toBe('number');
    });

    it('should have valid timestamp', async () => {
      const beforeTime = Date.now();
      const result = await detector.detect(testCapability);
      const afterTime = Date.now();

      expect(result.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(result.timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should measure detection time', async () => {
      const result = await detector.detect(testCapability);

      expect(result.detectionTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.detectionTimeMs).toBeLessThan(1000); // Should be fast
    });
  });
});

describe('hasFileSystemCapability Utility Function', () => {
  beforeEach(() => {
    resetGlobalCapabilityManager();
    vi.clearAllMocks();

    // Reset global objects
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true,
    });
    Object.defineProperty(global, 'navigator', {
      value: undefined,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should automatically register detector and return capability result', async () => {
    detectPlatformType.mockReturnValue(PlatformType.ELECTRON);
    Object.defineProperty(global, 'window', {
      value: { electronAPI: { filesystem: {} } },
      writable: true,
    });

    const result = await hasFileSystemCapability();

    expect(result.capability.id).toBe(PLATFORM_CAPABILITIES.FILE_SYSTEM_ACCESS);
    expect(result.available).toBe(true);
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('detectionTimeMs');
  });

  it('should reuse registered detector on subsequent calls', async () => {
    detectPlatformType.mockReturnValue(PlatformType.WEB);
    Object.defineProperty(global, 'window', {
      value: { showOpenFilePicker: vi.fn(), showSaveFilePicker: vi.fn() },
      writable: true,
    });

    // First call
    const result1 = await hasFileSystemCapability();
    // Second call
    const result2 = await hasFileSystemCapability();

    expect(result1.available).toBe(true);
    expect(result2.available).toBe(true);
    expect(result1.capability.id).toBe(result2.capability.id);
  });

  it('should return capability result for unsupported platform', async () => {
    detectPlatformType.mockReturnValue(PlatformType.UNKNOWN);

    const result = await hasFileSystemCapability();

    expect(result.available).toBe(false);
    expect(result.capability.id).toBe(PLATFORM_CAPABILITIES.FILE_SYSTEM_ACCESS);
  });

  it('should handle errors gracefully', async () => {
    // Force an error by making detectPlatformType throw
    detectPlatformType.mockImplementation(() => {
      throw new Error('Platform detection failed');
    });

    const result = await hasFileSystemCapability();

    expect(result.available).toBe(false);
    expect(result.evidence).toContain('Error during detection: Platform detection failed');
  });
});

describe('Type Safety and Integration', () => {
  it('should have correct TypeScript types', () => {
    const detector = new FileSystemCapabilityDetector();

    // Test return types
    expect(typeof detector.getId()).toBe('string');
    expect(Array.isArray(detector.getSupportedCapabilities())).toBe(true);

    // Test capability ID type
    const capabilities = detector.getSupportedCapabilities();
    expect(capabilities[0]).toBe(PLATFORM_CAPABILITIES.FILE_SYSTEM_ACCESS);
  });

  it('should integrate with capability constants', () => {
    const detector = new FileSystemCapabilityDetector();
    const supportedCapabilities = detector.getSupportedCapabilities();

    expect(supportedCapabilities).toContain(PLATFORM_CAPABILITIES.FILE_SYSTEM_ACCESS);
    expect(PLATFORM_CAPABILITIES.FILE_SYSTEM_ACCESS).toBe('fileSystemAccess');
  });
});
