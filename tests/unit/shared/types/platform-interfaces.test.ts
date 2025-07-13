/**
 * Platform Interface Type Validation Tests
 *
 * Basic tests to ensure TypeScript interfaces can be imported and used correctly.
 * Validates type definitions and interface completeness for platform detection system.
 */

import { describe, it, expect } from 'vitest';

// Import constants and existing types that should be available
import { PlatformType } from '../../../../src/shared/constants/platform/PlatformType';
import { OperatingSystem } from '../../../../src/shared/constants/platform/OperatingSystem';
import { RuntimeEnvironment } from '../../../../src/shared/constants/platform/RuntimeEnvironment';
import { PlatformErrorType } from '../../../../src/shared/types/platform/PlatformErrorType';

// Import a few key interface files directly to test they exist and compile
import type { PlatformDetectionResult } from '../../../../src/shared/types/platform/PlatformDetectionResult';
import type { PlatformError } from '../../../../src/shared/types/platform/PlatformError';
import type { UsePlatformReturn } from '../../../../src/shared/types/platform/UsePlatformReturn';
import type { PlatformCapability } from '../../../../src/shared/types/platform/PlatformCapability';
import type { PlatformServiceDescriptor } from '../../../../src/shared/types/platform/PlatformServiceDescriptor';

describe('Platform Interface Type Validation', () => {
  describe('Constants and Enums', () => {
    it('should export platform type constants', () => {
      expect(PlatformType.ELECTRON).toBe('electron');
      expect(PlatformType.CAPACITOR).toBe('capacitor');
      expect(PlatformType.WEB).toBe('web');
      expect(PlatformType.UNKNOWN).toBe('unknown');
    });

    it('should export operating system constants', () => {
      expect(OperatingSystem.MACOS).toBe('darwin');
      expect(OperatingSystem.WINDOWS).toBe('win32');
      expect(OperatingSystem.LINUX).toBe('linux');
      expect(OperatingSystem.IOS).toBe('ios');
      expect(OperatingSystem.ANDROID).toBe('android');
    });

    it('should export runtime environment constants', () => {
      expect(RuntimeEnvironment.MAIN).toBe('main');
      expect(RuntimeEnvironment.RENDERER).toBe('renderer');
      expect(RuntimeEnvironment.NATIVE).toBe('native');
      expect(RuntimeEnvironment.BROWSER).toBe('browser');
    });

    it('should export platform error type constants', () => {
      expect(PlatformErrorType.DETECTION_FAILED).toBe('detection_failed');
      expect(PlatformErrorType.API_UNAVAILABLE).toBe('api_unavailable');
      expect(PlatformErrorType.UNSUPPORTED_PLATFORM).toBe('unsupported_platform');
    });
  });

  describe('Interface Type Validation', () => {
    it('should validate PlatformDetectionResult interface', () => {
      const result: PlatformDetectionResult = {
        platformType: PlatformType.ELECTRON,
        success: true,
        confidence: 95,
        timestamp: Date.now(),
        detectionMethod: 'electron-api-check',
        metadata: { version: '1.0.0' },
      };

      expect(result.platformType).toBe(PlatformType.ELECTRON);
      expect(result.success).toBe(true);
      expect(result.confidence).toBe(95);
    });

    it('should validate PlatformError interface', () => {
      const error: PlatformError = {
        type: PlatformErrorType.DETECTION_FAILED,
        message: 'Platform detection failed',
        retryable: true,
        timestamp: Date.now(),
      };

      expect(error.type).toBe(PlatformErrorType.DETECTION_FAILED);
      expect(error.retryable).toBe(true);
    });

    it('should validate UsePlatformReturn interface structure', () => {
      const hookReturn: UsePlatformReturn = {
        // State properties
        platformInfo: null,
        platformType: PlatformType.ELECTRON,
        operatingSystem: OperatingSystem.MACOS,
        runtimeEnvironment: RuntimeEnvironment.RENDERER,
        loading: false,
        error: null,
        initialized: true,
        lastDetectionTime: Date.now(),

        // Action methods
        refreshPlatform: async () => {},
        isPlatform: () => true,
        getPlatformDetails: async () => {},
        clearError: () => {},
        forceRedetection: async () => {},
      };

      expect(hookReturn.platformType).toBe(PlatformType.ELECTRON);
      expect(typeof hookReturn.refreshPlatform).toBe('function');
    });

    it('should validate PlatformCapability interface', () => {
      const capability: PlatformCapability = {
        id: 'secure-storage',
        name: 'Secure Storage',
        description: 'Access to system keychain',
        supportedPlatforms: [PlatformType.ELECTRON],
        available: true,
        confidence: 100,
        requiresPermissions: false,
      };

      expect(capability.id).toBe('secure-storage');
      expect(capability.supportedPlatforms).toContain(PlatformType.ELECTRON);
    });

    it('should validate PlatformServiceDescriptor interface', () => {
      const descriptor: PlatformServiceDescriptor = {
        serviceId: 'ai-service',
        serviceName: 'AI Service',
        description: 'AI integration service',
        supportedPlatforms: [PlatformType.ELECTRON],
        requiredCapabilities: ['network'],
        implementationName: 'AIServiceImpl',
        priority: 1,
        critical: false,
        dependencies: [],
        lazyLoad: false,
      };

      expect(descriptor.serviceId).toBe('ai-service');
      expect(descriptor.supportedPlatforms).toHaveLength(1);
    });
  });

  describe('Type Compatibility', () => {
    it('should ensure interfaces use consistent enum types', () => {
      const result: PlatformDetectionResult = {
        platformType: PlatformType.WEB,
        success: true,
        confidence: 90,
        timestamp: Date.now(),
        detectionMethod: 'browser-check',
      };

      const error: PlatformError = {
        type: PlatformErrorType.API_UNAVAILABLE,
        message: 'API not available in web environment',
        retryable: false,
        timestamp: Date.now(),
      };

      // Verify types are compatible and consistent
      expect(typeof result.platformType).toBe('string');
      expect(typeof error.type).toBe('string');
      expect(result.success).toBe(true);
      expect(error.retryable).toBe(false);
    });
  });
});
