/**
 * Platform Type Guards Test Suite
 *
 * Comprehensive tests for all platform type guard functions to ensure
 * proper TypeScript type narrowing and runtime behavior validation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isElectronEnvironment,
  isCapacitorEnvironment,
  isWebEnvironment,
  isPlatformType,
  isKnownPlatform,
  isPlatformContext,
  type PlatformContextType,
} from '../../../../../src/shared/utils/platform';
import { PlatformType } from '../../../../../src/shared/constants/platform/PlatformType';
import * as isElectronPlatformModule from '../../../../../src/shared/utils/platform/isElectronPlatform';
import * as isCapacitorPlatformModule from '../../../../../src/shared/utils/platform/isCapacitorPlatform';
import * as isWebPlatformModule from '../../../../../src/shared/utils/platform/isWebPlatform';
import * as detectPlatformTypeModule from '../../../../../src/shared/utils/platform/detectPlatformType';

describe('Platform Type Guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isElectronEnvironment', () => {
    it('should return true when Electron platform is detected', () => {
      // Arrange
      vi.spyOn(isElectronPlatformModule, 'isElectronPlatform').mockReturnValue(true);

      // Act
      const result = isElectronEnvironment();

      // Assert
      expect(result).toBe(true);
      expect(isElectronPlatformModule.isElectronPlatform).toHaveBeenCalledOnce();
    });

    it('should return false when Electron platform is not detected', () => {
      // Arrange
      vi.spyOn(isElectronPlatformModule, 'isElectronPlatform').mockReturnValue(false);

      // Act
      const result = isElectronEnvironment();

      // Assert
      expect(result).toBe(false);
      expect(isElectronPlatformModule.isElectronPlatform).toHaveBeenCalledOnce();
    });

    it('should return false and handle errors safely', () => {
      // Arrange
      vi.spyOn(isElectronPlatformModule, 'isElectronPlatform').mockImplementation(() => {
        throw new Error('Detection error');
      });

      // Act
      const result = isElectronEnvironment();

      // Assert
      expect(result).toBe(false);
    });

    it('should work with context parameter', () => {
      // Arrange
      vi.spyOn(isElectronPlatformModule, 'isElectronPlatform').mockReturnValue(true);
      const mockContext: unknown = { some: 'context' };

      // Act
      const result = isElectronEnvironment(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should provide correct TypeScript type narrowing', () => {
      // This test ensures type narrowing works at compile time
      // Runtime verification that the type guard works correctly
      vi.spyOn(isElectronPlatformModule, 'isElectronPlatform').mockReturnValue(true);

      const context: unknown = {
        platform: 'electron',
        electronAPI: {},
        isDesktop: true,
      };
      if (isElectronEnvironment(context)) {
        // TypeScript should narrow context to ElectronEnvironment
        // This would fail compilation if type narrowing doesn't work
        expect(context.platform).toBe('electron');
        expect(context.isDesktop).toBe(true);
      }
    });
  });

  describe('isCapacitorEnvironment', () => {
    it('should return true when Capacitor platform is detected', () => {
      // Arrange
      vi.spyOn(isCapacitorPlatformModule, 'isCapacitorPlatform').mockReturnValue(true);

      // Act
      const result = isCapacitorEnvironment();

      // Assert
      expect(result).toBe(true);
      expect(isCapacitorPlatformModule.isCapacitorPlatform).toHaveBeenCalledOnce();
    });

    it('should return false when Capacitor platform is not detected', () => {
      // Arrange
      vi.spyOn(isCapacitorPlatformModule, 'isCapacitorPlatform').mockReturnValue(false);

      // Act
      const result = isCapacitorEnvironment();

      // Assert
      expect(result).toBe(false);
      expect(isCapacitorPlatformModule.isCapacitorPlatform).toHaveBeenCalledOnce();
    });

    it('should return false and handle errors safely', () => {
      // Arrange
      vi.spyOn(isCapacitorPlatformModule, 'isCapacitorPlatform').mockImplementation(() => {
        throw new Error('Detection error');
      });

      // Act
      const result = isCapacitorEnvironment();

      // Assert
      expect(result).toBe(false);
    });

    it('should provide correct TypeScript type narrowing', () => {
      vi.spyOn(isCapacitorPlatformModule, 'isCapacitorPlatform').mockReturnValue(true);

      const context: unknown = {
        platform: 'capacitor',
        capacitorAPI: {},
        isMobile: true,
        isNative: true,
      };
      if (isCapacitorEnvironment(context)) {
        // TypeScript should narrow context to CapacitorEnvironment
        expect(context.platform).toBe('capacitor');
        expect(context.isMobile).toBe(true);
        expect(context.isNative).toBe(true);
      }
    });
  });

  describe('isWebEnvironment', () => {
    it('should return true when Web platform is detected', () => {
      // Arrange
      vi.spyOn(isWebPlatformModule, 'isWebPlatform').mockReturnValue(true);

      // Act
      const result = isWebEnvironment();

      // Assert
      expect(result).toBe(true);
      expect(isWebPlatformModule.isWebPlatform).toHaveBeenCalledOnce();
    });

    it('should return false when Web platform is not detected', () => {
      // Arrange
      vi.spyOn(isWebPlatformModule, 'isWebPlatform').mockReturnValue(false);

      // Act
      const result = isWebEnvironment();

      // Assert
      expect(result).toBe(false);
      expect(isWebPlatformModule.isWebPlatform).toHaveBeenCalledOnce();
    });

    it('should return false and handle errors safely', () => {
      // Arrange
      vi.spyOn(isWebPlatformModule, 'isWebPlatform').mockImplementation(() => {
        throw new Error('Detection error');
      });

      // Act
      const result = isWebEnvironment();

      // Assert
      expect(result).toBe(false);
    });

    it('should provide correct TypeScript type narrowing', () => {
      vi.spyOn(isWebPlatformModule, 'isWebPlatform').mockReturnValue(true);

      const context: unknown = {
        platform: 'web',
        navigator: {},
        isBrowser: true,
        hasDOM: true,
      };
      if (isWebEnvironment(context)) {
        // TypeScript should narrow context to WebEnvironment
        expect(context.platform).toBe('web');
        expect(context.isBrowser).toBe(true);
        expect(context.hasDOM).toBe(true);
      }
    });
  });

  describe('isPlatformType', () => {
    it('should return true when platform matches target type', () => {
      // Arrange
      vi.spyOn(detectPlatformTypeModule, 'detectPlatformType').mockReturnValue(
        PlatformType.ELECTRON,
      );

      // Act
      const result = isPlatformType(PlatformType.ELECTRON);

      // Assert
      expect(result).toBe(true);
      expect(detectPlatformTypeModule.detectPlatformType).toHaveBeenCalledOnce();
    });

    it('should return false when platform does not match target type', () => {
      // Arrange
      vi.spyOn(detectPlatformTypeModule, 'detectPlatformType').mockReturnValue(PlatformType.WEB);

      // Act
      const result = isPlatformType(PlatformType.ELECTRON);

      // Assert
      expect(result).toBe(false);
      expect(detectPlatformTypeModule.detectPlatformType).toHaveBeenCalledOnce();
    });

    it('should return false for invalid platform type input', () => {
      // Act
      const result = isPlatformType('invalid' as PlatformType);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle detection errors safely', () => {
      // Arrange
      vi.spyOn(detectPlatformTypeModule, 'detectPlatformType').mockImplementation(() => {
        throw new Error('Detection error');
      });

      // Act
      const result = isPlatformType(PlatformType.ELECTRON);

      // Assert
      expect(result).toBe(false);
    });

    it('should work with all valid platform types', () => {
      const validPlatforms = [
        PlatformType.ELECTRON,
        PlatformType.CAPACITOR,
        PlatformType.WEB,
        PlatformType.UNKNOWN,
      ];

      validPlatforms.forEach(platform => {
        // Arrange
        vi.spyOn(detectPlatformTypeModule, 'detectPlatformType').mockReturnValue(platform);

        // Act
        const result = isPlatformType(platform);

        // Assert
        expect(result).toBe(true);

        // Reset for next iteration
        vi.clearAllMocks();
      });
    });
  });

  describe('isKnownPlatform', () => {
    it('should return true for Electron platform', () => {
      // Arrange
      vi.spyOn(detectPlatformTypeModule, 'detectPlatformType').mockReturnValue(
        PlatformType.ELECTRON,
      );

      // Act
      const result = isKnownPlatform();

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for Capacitor platform', () => {
      // Arrange
      vi.spyOn(detectPlatformTypeModule, 'detectPlatformType').mockReturnValue(
        PlatformType.CAPACITOR,
      );

      // Act
      const result = isKnownPlatform();

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for Web platform', () => {
      // Arrange
      vi.spyOn(detectPlatformTypeModule, 'detectPlatformType').mockReturnValue(PlatformType.WEB);

      // Act
      const result = isKnownPlatform();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for Unknown platform', () => {
      // Arrange
      vi.spyOn(detectPlatformTypeModule, 'detectPlatformType').mockReturnValue(
        PlatformType.UNKNOWN,
      );

      // Act
      const result = isKnownPlatform();

      // Assert
      expect(result).toBe(false);
    });

    it('should work with explicit platform parameter', () => {
      // Act & Assert
      expect(isKnownPlatform(PlatformType.ELECTRON)).toBe(true);
      expect(isKnownPlatform(PlatformType.CAPACITOR)).toBe(true);
      expect(isKnownPlatform(PlatformType.WEB)).toBe(true);
      expect(isKnownPlatform(PlatformType.UNKNOWN)).toBe(false);
    });

    it('should handle detection errors safely', () => {
      // Arrange
      vi.spyOn(detectPlatformTypeModule, 'detectPlatformType').mockImplementation(() => {
        throw new Error('Detection error');
      });

      // Act
      const result = isKnownPlatform();

      // Assert
      expect(result).toBe(false);
    });

    it('should provide correct TypeScript type narrowing', () => {
      const platform: PlatformType = PlatformType.ELECTRON;
      if (isKnownPlatform(platform)) {
        // TypeScript should narrow platform to KnownPlatformType
        expect(platform).toBe(PlatformType.ELECTRON);
      }
    });
  });

  describe('isPlatformContext', () => {
    const validPlatformContext: PlatformContextType = {
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

    it('should return true for valid platform context', () => {
      // Act
      const result = isPlatformContext(validPlatformContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for null', () => {
      // Act
      const result = isPlatformContext(null);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for undefined', () => {
      // Act
      const result = isPlatformContext(undefined);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for non-object values', () => {
      expect(isPlatformContext('string')).toBe(false);
      expect(isPlatformContext(123)).toBe(false);
      expect(isPlatformContext(true)).toBe(false);
      expect(isPlatformContext([])).toBe(false);
    });

    it('should return false for invalid platformType', () => {
      // Arrange
      const invalidContext = {
        ...validPlatformContext,
        platformType: 'invalid',
      };

      // Act
      const result = isPlatformContext(invalidContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for missing detections object', () => {
      // Arrange
      const invalidContext = {
        ...validPlatformContext,
        detections: null,
      };

      // Act
      const result = isPlatformContext(invalidContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for invalid detections properties', () => {
      // Arrange
      const invalidContext = {
        ...validPlatformContext,
        detections: {
          isElectron: 'not-boolean',
          isCapacitor: false,
          isWeb: false,
        },
      };

      // Act
      const result = isPlatformContext(invalidContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for missing environment object', () => {
      // Arrange
      const invalidContext = {
        ...validPlatformContext,
        environment: null,
      };

      // Act
      const result = isPlatformContext(invalidContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for invalid environment properties', () => {
      // Arrange
      const invalidContext = {
        ...validPlatformContext,
        environment: {
          hasWindow: true,
          hasElectronAPI: 'not-boolean',
          hasCapacitorAPI: false,
          hasNavigator: true,
        },
      };

      // Act
      const result = isPlatformContext(invalidContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for invalid timestamp', () => {
      const invalidCases = [
        { ...validPlatformContext, timestamp: 'not-number' },
        { ...validPlatformContext, timestamp: 1.5 }, // Not integer
        { ...validPlatformContext, timestamp: -1 }, // Negative
        { ...validPlatformContext, timestamp: 0 }, // Zero
      ];

      invalidCases.forEach(invalidContext => {
        expect(isPlatformContext(invalidContext)).toBe(false);
      });
    });

    it('should handle validation errors safely', () => {
      // Arrange - Create an object that will cause an error during validation
      const problematicObject = {};
      Object.defineProperty(problematicObject, 'platformType', {
        get() {
          throw new Error('Property access error');
        },
      });

      // Act
      const result = isPlatformContext(problematicObject);

      // Assert
      expect(result).toBe(false);
    });

    it('should provide correct TypeScript type narrowing', () => {
      const context: unknown = validPlatformContext;
      if (isPlatformContext(context)) {
        // TypeScript should narrow context to PlatformContextType
        expect(context.platformType).toBe(PlatformType.ELECTRON);
        expect(context.detections.isElectron).toBe(true);
      }
    });
  });

  describe('Type Guard Integration', () => {
    it('should work together for comprehensive platform checking', () => {
      // Arrange
      vi.spyOn(detectPlatformTypeModule, 'detectPlatformType').mockReturnValue(
        PlatformType.ELECTRON,
      );
      vi.spyOn(isElectronPlatformModule, 'isElectronPlatform').mockReturnValue(true);

      // Act & Assert
      expect(isPlatformType(PlatformType.ELECTRON)).toBe(true);
      expect(isKnownPlatform()).toBe(true);
      expect(isElectronEnvironment()).toBe(true);
      expect(isCapacitorEnvironment()).toBe(false);
      expect(isWebEnvironment()).toBe(false);
    });

    it('should handle mixed environment correctly', () => {
      // Arrange - Simulate Capacitor environment
      vi.spyOn(detectPlatformTypeModule, 'detectPlatformType').mockReturnValue(
        PlatformType.CAPACITOR,
      );
      vi.spyOn(isElectronPlatformModule, 'isElectronPlatform').mockReturnValue(false);
      vi.spyOn(isCapacitorPlatformModule, 'isCapacitorPlatform').mockReturnValue(true);
      vi.spyOn(isWebPlatformModule, 'isWebPlatform').mockReturnValue(false);

      // Act & Assert
      expect(isPlatformType(PlatformType.CAPACITOR)).toBe(true);
      expect(isKnownPlatform()).toBe(true);
      expect(isElectronEnvironment()).toBe(false);
      expect(isCapacitorEnvironment()).toBe(true);
      expect(isWebEnvironment()).toBe(false);
    });
  });
});
