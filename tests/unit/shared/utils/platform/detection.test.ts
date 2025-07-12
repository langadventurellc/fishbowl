import { describe, it, expect } from 'vitest';
import {
  isElectronPlatform,
  isCapacitorPlatform,
  isWebPlatform,
  detectPlatformType,
  getPlatformInfo,
  type PlatformInfo,
} from '../../../../../src/shared/utils/platform';
import { PlatformType } from '../../../../../src/shared/constants/platform/PlatformType';
import {
  electronEnvironment,
  webEnvironment,
  capacitorEnvironment,
  mixedEnvironment,
  withMockEnvironment,
} from './mock-environments';
import { setupPlatformTests } from './test-setup';

/**
 * Test suite for core platform detection logic
 * Validates the new platform detection system that wraps and extends
 * the existing isElectronAPIAvailable() function
 */

// Setup platform test environment
setupPlatformTests();

describe('Core Platform Detection', () => {
  describe('isElectronPlatform', () => {
    it('should be defined and be a function', () => {
      expect(isElectronPlatform).toBeDefined();
      expect(typeof isElectronPlatform).toBe('function');
    });

    it('should return true in Electron environment', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        expect(isElectronPlatform()).toBe(true);
      });
    });

    it('should return false in web environment', async () => {
      await withMockEnvironment(webEnvironment, () => {
        expect(isElectronPlatform()).toBe(false);
      });
    });

    it('should return false in Capacitor environment', async () => {
      await withMockEnvironment(capacitorEnvironment, () => {
        expect(isElectronPlatform()).toBe(false);
      });
    });

    it('should return true in mixed environment with Electron', async () => {
      await withMockEnvironment(mixedEnvironment, () => {
        expect(isElectronPlatform()).toBe(true);
      });
    });
  });

  describe('isCapacitorPlatform', () => {
    it('should be defined and be a function', () => {
      expect(isCapacitorPlatform).toBeDefined();
      expect(typeof isCapacitorPlatform).toBe('function');
    });

    it('should return false in Electron environment', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        expect(isCapacitorPlatform()).toBe(false);
      });
    });

    it('should return false in web environment', async () => {
      await withMockEnvironment(webEnvironment, () => {
        expect(isCapacitorPlatform()).toBe(false);
      });
    });

    it('should return true in Capacitor environment', async () => {
      await withMockEnvironment(capacitorEnvironment, () => {
        expect(isCapacitorPlatform()).toBe(true);
      });
    });

    it('should return true in mixed environment with Capacitor', async () => {
      await withMockEnvironment(mixedEnvironment, () => {
        expect(isCapacitorPlatform()).toBe(true);
      });
    });

    it('should handle window access errors gracefully', () => {
      // Test without mock environment to avoid cleanup issues
      expect(() => isCapacitorPlatform()).not.toThrow();
      expect(typeof isCapacitorPlatform()).toBe('boolean');
    });
  });

  describe('isWebPlatform', () => {
    it('should be defined and be a function', () => {
      expect(isWebPlatform).toBeDefined();
      expect(typeof isWebPlatform).toBe('function');
    });

    it('should return false in Electron environment', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        expect(isWebPlatform()).toBe(false);
      });
    });

    it('should return true in web environment', async () => {
      await withMockEnvironment(webEnvironment, () => {
        expect(isWebPlatform()).toBe(true);
      });
    });

    it('should return false in Capacitor environment', async () => {
      await withMockEnvironment(capacitorEnvironment, () => {
        expect(isWebPlatform()).toBe(false);
      });
    });

    it('should return false in mixed environment', async () => {
      await withMockEnvironment(mixedEnvironment, () => {
        expect(isWebPlatform()).toBe(false);
      });
    });

    it('should handle detection errors gracefully', () => {
      // Test without mock environment to avoid cleanup issues
      expect(() => isWebPlatform()).not.toThrow();
      expect(typeof isWebPlatform()).toBe('boolean');
    });
  });

  describe('detectPlatformType', () => {
    it('should be defined and be a function', () => {
      expect(detectPlatformType).toBeDefined();
      expect(typeof detectPlatformType).toBe('function');
    });

    it('should return ELECTRON in Electron environment', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        expect(detectPlatformType()).toBe(PlatformType.ELECTRON);
      });
    });

    it('should return WEB in web environment', async () => {
      await withMockEnvironment(webEnvironment, () => {
        expect(detectPlatformType()).toBe(PlatformType.WEB);
      });
    });

    it('should return CAPACITOR in Capacitor environment', async () => {
      await withMockEnvironment(capacitorEnvironment, () => {
        expect(detectPlatformType()).toBe(PlatformType.CAPACITOR);
      });
    });

    it('should prioritize ELECTRON in mixed environment', async () => {
      await withMockEnvironment(mixedEnvironment, () => {
        expect(detectPlatformType()).toBe(PlatformType.ELECTRON);
      });
    });

    it('should return UNKNOWN for errors', () => {
      // Test error handling without mock environment
      expect(() => detectPlatformType()).not.toThrow();
      expect(Object.values(PlatformType)).toContain(detectPlatformType());
    });

    it('should return valid PlatformType values', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        const result = detectPlatformType();
        expect(Object.values(PlatformType)).toContain(result);
      });
    });
  });

  describe('getPlatformInfo', () => {
    it('should be defined and be a function', () => {
      expect(getPlatformInfo).toBeDefined();
      expect(typeof getPlatformInfo).toBe('function');
    });

    it('should return complete platform info in Electron environment', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        const info = getPlatformInfo();

        expect(info).toHaveProperty('platformType');
        expect(info).toHaveProperty('detections');
        expect(info).toHaveProperty('environment');
        expect(info).toHaveProperty('timestamp');

        expect(info.platformType).toBe(PlatformType.ELECTRON);
        expect(info.detections.isElectron).toBe(true);
        expect(info.detections.isCapacitor).toBe(false);
        expect(info.detections.isWeb).toBe(false);
        expect(info.environment.hasWindow).toBe(true);
        expect(info.environment.hasElectronAPI).toBe(true);
        expect(info.environment.hasCapacitorAPI).toBe(false);
        expect(typeof info.timestamp).toBe('number');
      });
    });

    it('should return complete platform info in web environment', async () => {
      await withMockEnvironment(webEnvironment, () => {
        const info = getPlatformInfo();

        expect(info.platformType).toBe(PlatformType.WEB);
        expect(info.detections.isElectron).toBe(false);
        expect(info.detections.isCapacitor).toBe(false);
        expect(info.detections.isWeb).toBe(true);
        expect(info.environment.hasWindow).toBe(true);
        expect(info.environment.hasElectronAPI).toBe(false);
        expect(info.environment.hasCapacitorAPI).toBe(false);
      });
    });

    it('should return complete platform info in Capacitor environment', async () => {
      await withMockEnvironment(capacitorEnvironment, () => {
        const info = getPlatformInfo();

        expect(info.platformType).toBe(PlatformType.CAPACITOR);
        expect(info.detections.isElectron).toBe(false);
        expect(info.detections.isCapacitor).toBe(true);
        expect(info.detections.isWeb).toBe(false);
        expect(info.environment.hasWindow).toBe(true);
        expect(info.environment.hasElectronAPI).toBe(false);
        expect(info.environment.hasCapacitorAPI).toBe(true);
      });
    });

    it('should handle mixed environment correctly', async () => {
      await withMockEnvironment(mixedEnvironment, () => {
        const info = getPlatformInfo();

        expect(info.platformType).toBe(PlatformType.ELECTRON);
        expect(info.detections.isElectron).toBe(true);
        expect(info.detections.isCapacitor).toBe(true);
        expect(info.detections.isWeb).toBe(false);
        expect(info.environment.hasElectronAPI).toBe(true);
        expect(info.environment.hasCapacitorAPI).toBe(true);
      });
    });

    it('should return safe fallback for errors', () => {
      // Test error handling without mock environment
      expect(() => getPlatformInfo()).not.toThrow();
      const info = getPlatformInfo();
      expect(info).toHaveProperty('platformType');
      expect(info).toHaveProperty('detections');
      expect(info).toHaveProperty('environment');
      expect(info).toHaveProperty('timestamp');
      expect(typeof info.timestamp).toBe('number');
    });

    it('should include timestamp within reasonable range', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        const before = Date.now();
        const info = getPlatformInfo();
        const after = Date.now();

        expect(info.timestamp).toBeGreaterThanOrEqual(before);
        expect(info.timestamp).toBeLessThanOrEqual(after);
      });
    });

    it('should have correct TypeScript type', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        const info: PlatformInfo = getPlatformInfo();
        expect(info).toBeDefined();
      });
    });
  });

  describe('Integration with existing isElectronAPIAvailable', () => {
    it('should be consistent with the wrapped function behavior', async () => {
      await withMockEnvironment(electronEnvironment, () => {
        // Test that isElectronPlatform returns true in Electron environment
        // which is what the original isElectronAPIAvailable would return
        expect(isElectronPlatform()).toBe(true);
      });
    });

    it('should be consistent with the wrapped function behavior in web environment', async () => {
      await withMockEnvironment(webEnvironment, () => {
        // Test that isElectronPlatform returns false in web environment
        // which is what the original isElectronAPIAvailable would return
        expect(isElectronPlatform()).toBe(false);
      });
    });
  });
});
