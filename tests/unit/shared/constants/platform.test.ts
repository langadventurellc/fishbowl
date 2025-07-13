import {
  OperatingSystem,
  PLATFORM_CAPABILITIES,
  PLATFORM_DETECTION_CONFIG,
  PLATFORM_ERROR_CODES,
  PLATFORM_GLOBALS,
  PlatformType,
  RuntimeEnvironment,
} from '@shared/constants/platform/';
import { describe, expect, it } from 'vitest';

describe('Platform Detection Constants', () => {
  describe('PlatformType enum', () => {
    it('should define all expected platform types', () => {
      expect(PlatformType.ELECTRON).toBe('electron');
      expect(PlatformType.CAPACITOR).toBe('capacitor');
      expect(PlatformType.WEB).toBe('web');
      expect(PlatformType.UNKNOWN).toBe('unknown');
    });

    it('should have string values for all enum members', () => {
      Object.values(PlatformType).forEach(value => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });

    it('should have exactly 4 platform types', () => {
      expect(Object.keys(PlatformType)).toHaveLength(4);
    });
  });

  describe('RuntimeEnvironment enum', () => {
    it('should define all expected runtime environments', () => {
      expect(RuntimeEnvironment.UNKNOWN).toBe('unknown');
      expect(RuntimeEnvironment.MAIN).toBe('main');
      expect(RuntimeEnvironment.RENDERER).toBe('renderer');
      expect(RuntimeEnvironment.NATIVE).toBe('native');
      expect(RuntimeEnvironment.BROWSER).toBe('browser');
    });

    it('should have string values for all enum members', () => {
      Object.values(RuntimeEnvironment).forEach(value => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });

    it('should have exactly 5 runtime environments', () => {
      expect(Object.keys(RuntimeEnvironment)).toHaveLength(5);
    });
  });

  describe('OperatingSystem enum', () => {
    it('should define all expected operating systems', () => {
      expect(OperatingSystem.WINDOWS).toBe('win32');
      expect(OperatingSystem.MACOS).toBe('darwin');
      expect(OperatingSystem.LINUX).toBe('linux');
      expect(OperatingSystem.IOS).toBe('ios');
      expect(OperatingSystem.ANDROID).toBe('android');
      expect(OperatingSystem.UNKNOWN).toBe('unknown');
    });

    it('should use NodeJS.Platform compatible values for desktop platforms', () => {
      // Ensure compatibility with existing platform detection
      expect(OperatingSystem.WINDOWS).toBe('win32');
      expect(OperatingSystem.MACOS).toBe('darwin');
      expect(OperatingSystem.LINUX).toBe('linux');
    });

    it('should have string values for all enum members', () => {
      Object.values(OperatingSystem).forEach(value => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });

    it('should have exactly 6 operating systems', () => {
      expect(Object.keys(OperatingSystem)).toHaveLength(6);
    });
  });

  describe('PLATFORM_DETECTION_CONFIG constants', () => {
    it('should define performance targets', () => {
      expect(PLATFORM_DETECTION_CONFIG.MAX_DETECTION_TIME_MS).toBe(100);
      expect(PLATFORM_DETECTION_CONFIG.CACHED_DETECTION_TARGET_MS).toBe(1);
      expect(PLATFORM_DETECTION_CONFIG.CACHE_DURATION_MS).toBe(60 * 60 * 1000);
    });

    it('should meet performance requirements', () => {
      // Cached detection target should be under 1ms as specified
      expect(PLATFORM_DETECTION_CONFIG.CACHED_DETECTION_TARGET_MS).toBeLessThanOrEqual(1);

      // Max detection time should be reasonable
      expect(PLATFORM_DETECTION_CONFIG.MAX_DETECTION_TIME_MS).toBeLessThanOrEqual(100);
    });

    it('should have debug logging disabled by default', () => {
      expect(PLATFORM_DETECTION_CONFIG.ENABLE_DEBUG_LOGGING).toBe(false);
    });

    it('should have reasonable cache duration', () => {
      const oneHourMs = 60 * 60 * 1000;
      expect(PLATFORM_DETECTION_CONFIG.CACHE_DURATION_MS).toBe(oneHourMs);
    });

    it('should have const assertion for type safety', () => {
      // TypeScript const assertion provides literal type inference
      // Runtime mutation is prevented by TypeScript compilation, not runtime behavior
      const config = PLATFORM_DETECTION_CONFIG;
      expect(typeof config.MAX_DETECTION_TIME_MS).toBe('number');
      expect(typeof config.CACHED_DETECTION_TARGET_MS).toBe('number');
    });
  });

  describe('PLATFORM_GLOBALS constants', () => {
    it('should define all expected global property names', () => {
      expect(PLATFORM_GLOBALS.ELECTRON_API).toBe('electronAPI');
      expect(PLATFORM_GLOBALS.CAPACITOR_API).toBe('Capacitor');
      expect(PLATFORM_GLOBALS.NAVIGATOR_API).toBe('navigator');
      expect(PLATFORM_GLOBALS.WINDOW_API).toBe('window');
      expect(PLATFORM_GLOBALS.PROCESS_API).toBe('process');
    });

    it('should match actual global object property names', () => {
      // These should match the actual property names used in runtime
      expect(PLATFORM_GLOBALS.ELECTRON_API).toBe('electronAPI');
      expect(PLATFORM_GLOBALS.CAPACITOR_API).toBe('Capacitor');
      expect(PLATFORM_GLOBALS.NAVIGATOR_API).toBe('navigator');
      expect(PLATFORM_GLOBALS.WINDOW_API).toBe('window');
      expect(PLATFORM_GLOBALS.PROCESS_API).toBe('process');
    });

    it('should have exactly 5 global properties', () => {
      expect(Object.keys(PLATFORM_GLOBALS)).toHaveLength(5);
    });
  });

  describe('PLATFORM_CAPABILITIES constants', () => {
    it('should define all expected platform capabilities', () => {
      expect(PLATFORM_CAPABILITIES.FILE_SYSTEM_ACCESS).toBe('fileSystemAccess');
      expect(PLATFORM_CAPABILITIES.SECURE_STORAGE).toBe('secureStorage');
      expect(PLATFORM_CAPABILITIES.NATIVE_NOTIFICATIONS).toBe('nativeNotifications');
      expect(PLATFORM_CAPABILITIES.SYSTEM_INTEGRATION).toBe('systemIntegration');
      expect(PLATFORM_CAPABILITIES.DATABASE_ACCESS).toBe('databaseAccess');
      expect(PLATFORM_CAPABILITIES.NETWORK_ACCESS).toBe('networkAccess');
    });

    it('should use camelCase naming for capability values', () => {
      Object.values(PLATFORM_CAPABILITIES).forEach(capability => {
        expect(capability).toMatch(/^[a-z][a-zA-Z]*$/);
      });
    });

    it('should have exactly 6 platform capabilities', () => {
      expect(Object.keys(PLATFORM_CAPABILITIES)).toHaveLength(6);
    });
  });

  describe('PLATFORM_ERROR_CODES constants', () => {
    it('should define all expected error codes', () => {
      expect(PLATFORM_ERROR_CODES.DETECTION_FAILED).toBe('PLATFORM_DETECTION_FAILED');
      expect(PLATFORM_ERROR_CODES.GLOBAL_ACCESS_ERROR).toBe('PLATFORM_GLOBAL_ACCESS_ERROR');
      expect(PLATFORM_ERROR_CODES.CACHE_INIT_ERROR).toBe('PLATFORM_CACHE_INIT_ERROR');
      expect(PLATFORM_ERROR_CODES.PERFORMANCE_THRESHOLD_EXCEEDED).toBe(
        'PLATFORM_PERFORMANCE_THRESHOLD_EXCEEDED',
      );
      expect(PLATFORM_ERROR_CODES.SECURITY_VALIDATION_FAILED).toBe(
        'PLATFORM_SECURITY_VALIDATION_FAILED',
      );
    });

    it('should use SCREAMING_SNAKE_CASE with PLATFORM_ prefix', () => {
      Object.values(PLATFORM_ERROR_CODES).forEach(errorCode => {
        expect(errorCode).toMatch(/^PLATFORM_[A-Z_]+$/);
      });
    });

    it('should have exactly 5 error codes', () => {
      expect(Object.keys(PLATFORM_ERROR_CODES)).toHaveLength(5);
    });
  });

  describe('Type safety and extensibility', () => {
    it('should maintain type safety for enum members', () => {
      // TypeScript should enforce string literal types
      const platformType: PlatformType = PlatformType.ELECTRON;
      expect(typeof platformType).toBe('string');

      const runtime: RuntimeEnvironment = RuntimeEnvironment.RENDERER;
      expect(typeof runtime).toBe('string');

      const os: OperatingSystem = OperatingSystem.MACOS;
      expect(typeof os).toBe('string');
    });

    it('should support future platform additions', () => {
      // Verify structure supports easy extension
      const allPlatforms = Object.values(PlatformType);
      expect(allPlatforms.includes(PlatformType.UNKNOWN)).toBe(true);

      const allRuntimes = Object.values(RuntimeEnvironment);
      expect(allRuntimes.every(runtime => typeof runtime === 'string')).toBe(true);
    });

    it('should maintain compatibility with NodeJS.Platform', () => {
      // Desktop OS values should match NodeJS.Platform
      const nodeJSCompatibleValues = ['win32', 'darwin', 'linux'];
      const desktopOS = [OperatingSystem.WINDOWS, OperatingSystem.MACOS, OperatingSystem.LINUX];

      desktopOS.forEach(os => {
        expect(nodeJSCompatibleValues.includes(os)).toBe(true);
      });
    });
  });
});
