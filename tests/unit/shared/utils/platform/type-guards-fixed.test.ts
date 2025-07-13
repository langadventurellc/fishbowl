/**
 * Fixed Platform Type Guards Test Suite
 *
 * Comprehensive tests for the fixed isPlatformType function to ensure
 * proper TypeScript type narrowing and runtime behavior validation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isPlatformType } from '../../../../../src/shared/utils/platform/isPlatformType';
import { PlatformType } from '../../../../../src/shared/constants/platform/PlatformType';
import type { AllPlatformEnvironment } from '../../../../../src/shared/types/platform/AllPlatformEnvironment';
import type { ElectronEnvironment } from '../../../../../src/shared/types/platform/ElectronEnvironment';
import type { CapacitorEnvironment } from '../../../../../src/shared/types/platform/CapacitorEnvironment';
import type { WebEnvironment } from '../../../../../src/shared/types/platform/WebEnvironment';
import type { UnknownEnvironment } from '../../../../../src/shared/types/platform/UnknownEnvironment';
import * as detectPlatformTypeModule from '../../../../../src/shared/utils/platform/detectPlatformType';

describe('Fixed Platform Type Guards - isPlatformType', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('with context parameter', () => {
    it('should return true and provide type narrowing for matching Electron context', () => {
      // Arrange
      const electronContext: AllPlatformEnvironment = {
        platform: 'electron',
        electronAPI: {},
        isDesktop: true,
      } as ElectronEnvironment;

      // Act
      const result = isPlatformType(electronContext, PlatformType.ELECTRON);

      // Assert
      expect(result).toBe(true);

      // TypeScript type narrowing verification
      if (isPlatformType(electronContext, PlatformType.ELECTRON)) {
        // context is narrowed to ElectronEnvironment
        expect(electronContext.platform).toBe('electron');
        expect(electronContext.isDesktop).toBe(true);
        // TypeScript should know electronAPI exists
        expect(electronContext.electronAPI).toBeDefined();
      }
    });

    it('should return true and provide type narrowing for matching Capacitor context', () => {
      // Arrange
      const capacitorContext: AllPlatformEnvironment = {
        platform: 'capacitor',
        capacitorAPI: {},
        isMobile: true,
        isNative: true,
      } as CapacitorEnvironment;

      // Act
      const result = isPlatformType(capacitorContext, PlatformType.CAPACITOR);

      // Assert
      expect(result).toBe(true);

      // TypeScript type narrowing verification
      if (isPlatformType(capacitorContext, PlatformType.CAPACITOR)) {
        // context is narrowed to CapacitorEnvironment
        expect(capacitorContext.platform).toBe('capacitor');
        expect(capacitorContext.isMobile).toBe(true);
        expect(capacitorContext.isNative).toBe(true);
        // TypeScript should know capacitorAPI exists
        expect(capacitorContext.capacitorAPI).toBeDefined();
      }
    });

    it('should return true and provide type narrowing for matching Web context', () => {
      // Arrange
      const webContext: AllPlatformEnvironment = {
        platform: 'web',
        navigator: {},
        isBrowser: true,
        hasDOM: true,
      } as WebEnvironment;

      // Act
      const result = isPlatformType(webContext, PlatformType.WEB);

      // Assert
      expect(result).toBe(true);

      // TypeScript type narrowing verification
      if (isPlatformType(webContext, PlatformType.WEB)) {
        // context is narrowed to WebEnvironment
        expect(webContext.platform).toBe('web');
        expect(webContext.isBrowser).toBe(true);
        expect(webContext.hasDOM).toBe(true);
        // TypeScript should know navigator exists
        expect(webContext.navigator).toBeDefined();
      }
    });

    it('should return true and provide type narrowing for matching Unknown context', () => {
      // Arrange
      const unknownContext: AllPlatformEnvironment = {
        platform: 'unknown',
        isKnown: false,
      } as UnknownEnvironment;

      // Act
      const result = isPlatformType(unknownContext, PlatformType.UNKNOWN);

      // Assert
      expect(result).toBe(true);

      // TypeScript type narrowing verification
      if (isPlatformType(unknownContext, PlatformType.UNKNOWN)) {
        // context is narrowed to UnknownEnvironment
        expect(unknownContext.platform).toBe('unknown');
        expect(unknownContext.isKnown).toBe(false);
      }
    });

    it('should return false for non-matching platform context', () => {
      // Arrange
      const electronContext: AllPlatformEnvironment = {
        platform: 'electron',
        electronAPI: {},
        isDesktop: true,
      } as ElectronEnvironment;

      // Act
      const result = isPlatformType(electronContext, PlatformType.WEB);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for invalid context object', () => {
      // Arrange
      const invalidContext = { notAPlatform: true };

      // Act
      const result = isPlatformType(
        invalidContext as unknown as AllPlatformEnvironment,
        PlatformType.ELECTRON,
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should handle null context safely', () => {
      // Act
      const result = isPlatformType(
        null as unknown as AllPlatformEnvironment,
        PlatformType.ELECTRON,
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should handle context with invalid platform property', () => {
      // Arrange
      const invalidContext = { platform: 'invalid-platform' };

      // Act
      const result = isPlatformType(
        invalidContext as unknown as AllPlatformEnvironment,
        PlatformType.ELECTRON,
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('without context parameter (fallback to current platform)', () => {
    it('should return true when current platform matches target', () => {
      // Arrange
      vi.spyOn(detectPlatformTypeModule, 'detectPlatformType').mockReturnValue(
        PlatformType.ELECTRON,
      );

      // Act
      const result = isPlatformType(undefined, PlatformType.ELECTRON);

      // Assert
      expect(result).toBe(true);
      expect(detectPlatformTypeModule.detectPlatformType).toHaveBeenCalledOnce();
    });

    it('should return false when current platform does not match target', () => {
      // Arrange
      vi.spyOn(detectPlatformTypeModule, 'detectPlatformType').mockReturnValue(PlatformType.WEB);

      // Act
      const result = isPlatformType(undefined, PlatformType.ELECTRON);

      // Assert
      expect(result).toBe(false);
      expect(detectPlatformTypeModule.detectPlatformType).toHaveBeenCalledOnce();
    });

    it('should handle detection errors safely', () => {
      // Arrange
      vi.spyOn(detectPlatformTypeModule, 'detectPlatformType').mockImplementation(() => {
        throw new Error('Detection error');
      });

      // Act
      const result = isPlatformType(undefined, PlatformType.ELECTRON);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('input validation', () => {
    it('should return false for invalid platform type input', () => {
      // Arrange
      const validContext: AllPlatformEnvironment = {
        platform: 'electron',
        electronAPI: {},
        isDesktop: true,
      } as ElectronEnvironment;

      // Act
      const result = isPlatformType(validContext, 'invalid' as PlatformType);

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
        const context: AllPlatformEnvironment = {
          platform: platform as any,
        } as AllPlatformEnvironment;

        // Act
        const result = isPlatformType(context, platform);

        // Assert
        expect(result).toBe(true);
      });
    });
  });

  describe('error handling', () => {
    it('should handle context property access errors safely', () => {
      // Arrange - Create an object that will cause an error during property access
      const problematicContext = {};
      Object.defineProperty(problematicContext, 'platform', {
        get() {
          throw new Error('Property access error');
        },
      });

      // Act
      const result = isPlatformType(
        problematicContext as unknown as AllPlatformEnvironment,
        PlatformType.ELECTRON,
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should handle validation schema errors safely', () => {
      // Arrange
      const validContext: AllPlatformEnvironment = {
        platform: 'electron',
        electronAPI: {},
        isDesktop: true,
      } as ElectronEnvironment;

      // Act - Pass invalid enum value that will fail schema validation
      const result = isPlatformType(validContext, {} as unknown as PlatformType);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('TypeScript type narrowing', () => {
    it('should provide discriminated union behavior', () => {
      // This test ensures the type guard provides proper discrimination
      const contexts: AllPlatformEnvironment[] = [
        { platform: 'electron', electronAPI: {}, isDesktop: true } as ElectronEnvironment,
        {
          platform: 'capacitor',
          capacitorAPI: {},
          isMobile: true,
          isNative: true,
        } as CapacitorEnvironment,
        { platform: 'web', navigator: {}, isBrowser: true, hasDOM: true } as WebEnvironment,
        { platform: 'unknown', isKnown: false } as UnknownEnvironment,
      ];

      contexts.forEach(context => {
        if (isPlatformType(context, PlatformType.ELECTRON)) {
          // TypeScript should narrow to ElectronEnvironment
          expect(context.platform).toBe('electron');
          expect(context.isDesktop).toBe(true);
        } else if (isPlatformType(context, PlatformType.CAPACITOR)) {
          // TypeScript should narrow to CapacitorEnvironment
          expect(context.platform).toBe('capacitor');
          expect(context.isMobile).toBe(true);
        } else if (isPlatformType(context, PlatformType.WEB)) {
          // TypeScript should narrow to WebEnvironment
          expect(context.platform).toBe('web');
          expect(context.isBrowser).toBe(true);
        } else if (isPlatformType(context, PlatformType.UNKNOWN)) {
          // TypeScript should narrow to UnknownEnvironment
          expect(context.platform).toBe('unknown');
          expect(context.isKnown).toBe(false);
        }
      });
    });
  });
});
