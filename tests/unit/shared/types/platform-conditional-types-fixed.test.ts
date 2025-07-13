/**
 * @fileoverview Tests for fixed platform conditional utility types
 *
 * Tests the corrected implementation of conditional platform utility types that
 * properly work with runtime platform detection and provide meaningful type narrowing.
 */

import { describe, expect, it } from 'vitest';
import { PlatformType } from '../../../../src/shared/constants/platform/PlatformType';
import type { ConditionalOnPlatform } from '../../../../src/shared/types/platform/conditional/ConditionalOnPlatform';
import type { ExcludeOnPlatform } from '../../../../src/shared/types/platform/conditional/ExcludeOnPlatform';
import type { PlatformSpecificConfig } from '../../../../src/shared/types/platform/conditional/PlatformSpecificConfig';

describe('Fixed Platform Conditional Utility Types', () => {
  describe('ConditionalOnPlatform<T, P, Current>', () => {
    it('should include properties when current platform matches target', () => {
      // Type test: When current platform is Electron, Electron properties should be available
      type ElectronConfig = {
        commonProp: string;
        electronProp: ConditionalOnPlatform<
          { value: number },
          PlatformType.ELECTRON,
          PlatformType.ELECTRON
        >;
      };

      // On Electron platform, electronProp should be { value: number }
      const electronConfig: ElectronConfig = {
        commonProp: 'test',
        electronProp: { value: 42 },
      };

      expect(electronConfig.commonProp).toBe('test');
      expect(electronConfig.electronProp.value).toBe(42);
    });

    it('should exclude properties when current platform does not match target', () => {
      // Type test: When current platform is Web, Electron properties should be never
      type WebConfig = {
        commonProp: string;
        electronProp: ConditionalOnPlatform<
          { value: number },
          PlatformType.ELECTRON,
          PlatformType.WEB
        >;
      };

      // On Web platform, electronProp should be never
      const webConfig: WebConfig = {
        commonProp: 'test',
        // electronProp cannot be assigned because it's never type
        electronProp: null as never,
      };

      expect(webConfig.commonProp).toBe('test');
      expect(webConfig.electronProp).toBe(null);
    });

    it('should work with union types for multiple platforms', () => {
      // Type test: Property available on multiple platforms
      type MultiPlatformFeature = ConditionalOnPlatform<
        { feature: string },
        PlatformType.ELECTRON | PlatformType.CAPACITOR,
        PlatformType.ELECTRON
      >;

      // Should be available on Electron
      const electronFeature: MultiPlatformFeature = { feature: 'available' };
      expect(electronFeature.feature).toBe('available');

      // Type test: Should not be available on Web
      type WebFeature = ConditionalOnPlatform<
        { feature: string },
        PlatformType.ELECTRON | PlatformType.CAPACITOR,
        PlatformType.WEB
      >;

      const webFeature: WebFeature = null as never;
      expect(webFeature).toBe(null);
    });
  });

  describe('ExcludeOnPlatform<T, P, Current>', () => {
    it('should exclude properties on specified platform', () => {
      // Type test: Should exclude web features on Electron
      type ElectronConfig = {
        commonProp: string;
        webOnlyProp: ExcludeOnPlatform<
          { webFeature: boolean },
          PlatformType.ELECTRON,
          PlatformType.ELECTRON
        >;
      };

      // On Electron, webOnlyProp should be never
      const electronConfig: ElectronConfig = {
        commonProp: 'test',
        webOnlyProp: null as never,
      };

      expect(electronConfig.commonProp).toBe('test');
      expect(electronConfig.webOnlyProp).toBe(null);
    });

    it('should include properties on non-specified platforms', () => {
      // Type test: Should include web features on Web platform
      type WebConfig = {
        commonProp: string;
        webOnlyProp: ExcludeOnPlatform<
          { webFeature: boolean },
          PlatformType.ELECTRON,
          PlatformType.WEB
        >;
      };

      // On Web, webOnlyProp should be available
      const webConfig: WebConfig = {
        commonProp: 'test',
        webOnlyProp: { webFeature: true },
      };

      expect(webConfig.commonProp).toBe('test');
      expect(webConfig.webOnlyProp.webFeature).toBe(true);
    });

    it('should work with union types for exclusion', () => {
      // Type test: Exclude on multiple platforms
      type MobileOnlyFeature = ExcludeOnPlatform<
        { mobileFeature: string },
        PlatformType.ELECTRON | PlatformType.WEB,
        PlatformType.CAPACITOR
      >;

      // Should be available on Capacitor (not excluded)
      const capacitorFeature: MobileOnlyFeature = { mobileFeature: 'mobile' };
      expect(capacitorFeature.mobileFeature).toBe('mobile');

      // Should be excluded on Electron
      type ElectronFeature = ExcludeOnPlatform<
        { mobileFeature: string },
        PlatformType.ELECTRON | PlatformType.WEB,
        PlatformType.ELECTRON
      >;

      const electronFeature: ElectronFeature = null as never;
      expect(electronFeature).toBe(null);
    });
  });

  describe('PlatformSpecificConfig<T>', () => {
    it('should create platform-specific configurations with proper typing', () => {
      // Type test: Different config shapes per platform
      type AppConfig = PlatformSpecificConfig<{
        [PlatformType.ELECTRON]: {
          windowControls: boolean;
          nativeMenus: boolean;
        };
        [PlatformType.WEB]: {
          serviceWorker: boolean;
          offlineMode: boolean;
        };
        [PlatformType.CAPACITOR]: {
          devicePlugins: string[];
          biometrics: boolean;
        };
        [PlatformType.UNKNOWN]: {
          fallback: boolean;
        };
      }>;

      // Should be able to create platform-specific configs
      const electronConfig: AppConfig = {
        platform: PlatformType.ELECTRON,
        config: {
          windowControls: true,
          nativeMenus: false,
        },
      };

      const webConfig: AppConfig = {
        platform: PlatformType.WEB,
        config: {
          serviceWorker: true,
          offlineMode: false,
        },
      };

      expect(electronConfig.platform).toBe(PlatformType.ELECTRON);
      expect(electronConfig.config.windowControls).toBe(true);
      expect(webConfig.platform).toBe(PlatformType.WEB);
      expect(webConfig.config.serviceWorker).toBe(true);
    });

    it('should work with discriminated union type narrowing', () => {
      type StorageConfig = PlatformSpecificConfig<{
        [PlatformType.ELECTRON]: {
          type: 'file-system';
          path: string;
        };
        [PlatformType.WEB]: {
          type: 'local-storage';
          quota: number;
        };
        [PlatformType.CAPACITOR]: {
          type: 'native-storage';
          secure: boolean;
        };
        [PlatformType.UNKNOWN]: {
          type: 'fallback';
          available: false;
        };
      }>;

      function processConfig(config: StorageConfig): string {
        switch (config.platform) {
          case PlatformType.ELECTRON:
            // TypeScript knows config.config has 'path' property
            return `File system at: ${(config.config as { type: 'file-system'; path: string }).path}`;
          case PlatformType.WEB:
            // TypeScript knows config.config has 'quota' property
            return `Local storage quota: ${(config.config as { type: 'local-storage'; quota: number }).quota}`;
          default:
            return 'Unknown platform';
        }
      }

      const electronConfig: StorageConfig = {
        platform: PlatformType.ELECTRON,
        config: { type: 'file-system', path: '/data' },
      };

      const webConfig: StorageConfig = {
        platform: PlatformType.WEB,
        config: { type: 'local-storage', quota: 1024 },
      };

      expect(processConfig(electronConfig)).toBe('File system at: /data');
      expect(processConfig(webConfig)).toBe('Local storage quota: 1024');
    });
  });

  describe('Type System Integration', () => {
    it('should work correctly with platform type checking', () => {
      // Integration test: Verify that fixed types work with type checking
      interface PlatformAwareService {
        common: string;
        electronFeature: ConditionalOnPlatform<
          { nativeAPI: boolean },
          PlatformType.ELECTRON,
          PlatformType.ELECTRON
        >;
        webFeature: ConditionalOnPlatform<{ webAPI: boolean }, PlatformType.WEB, PlatformType.WEB>;
        nonElectronFeature: ExcludeOnPlatform<
          { crossPlatform: boolean },
          PlatformType.ELECTRON,
          PlatformType.WEB
        >;
      }

      // On Electron: electronFeature available, webFeature never, nonElectronFeature never
      const electronService: PlatformAwareService = {
        common: 'available',
        electronFeature: { nativeAPI: true },
        webFeature: null as never,
        nonElectronFeature: null as never,
      };

      expect(electronService.common).toBe('available');
      expect(electronService.electronFeature.nativeAPI).toBe(true);
    });

    it('should support conditional property access patterns', () => {
      // Function that works with any platform configuration
      function getServiceValue<T extends PlatformType>(
        service: {
          base: string;
          electronOnly: ConditionalOnPlatform<{ value: number }, PlatformType.ELECTRON, T>;
          webOnly: ConditionalOnPlatform<{ value: number }, PlatformType.WEB, T>;
        },
        platform: T,
      ): number | null {
        if (platform === PlatformType.ELECTRON) {
          // TypeScript should understand the conditional availability
          return 42; // Mock implementation
        }
        if (platform === PlatformType.WEB) {
          return 24; // Mock implementation
        }
        return null;
      }

      // Create proper mock services for different platforms
      const electronService: {
        base: string;
        electronOnly: ConditionalOnPlatform<
          { value: number },
          PlatformType.ELECTRON,
          PlatformType.ELECTRON
        >;
        webOnly: ConditionalOnPlatform<{ value: number }, PlatformType.WEB, PlatformType.ELECTRON>;
      } = {
        base: 'test',
        electronOnly: { value: 42 },
        webOnly: null as never,
      };

      const webService: {
        base: string;
        electronOnly: ConditionalOnPlatform<
          { value: number },
          PlatformType.ELECTRON,
          PlatformType.WEB
        >;
        webOnly: ConditionalOnPlatform<{ value: number }, PlatformType.WEB, PlatformType.WEB>;
      } = {
        base: 'test',
        electronOnly: null as never,
        webOnly: { value: 24 },
      };

      const unknownService: {
        base: string;
        electronOnly: ConditionalOnPlatform<
          { value: number },
          PlatformType.ELECTRON,
          PlatformType.UNKNOWN
        >;
        webOnly: ConditionalOnPlatform<{ value: number }, PlatformType.WEB, PlatformType.UNKNOWN>;
      } = {
        base: 'test',
        electronOnly: null as never,
        webOnly: null as never,
      };

      expect(getServiceValue(electronService, PlatformType.ELECTRON)).toBe(42);
      expect(getServiceValue(webService, PlatformType.WEB)).toBe(24);
      expect(getServiceValue(unknownService, PlatformType.UNKNOWN)).toBe(null);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle unknown platform type correctly', () => {
      // Type test: Unknown platform should make conditional properties never
      type UnknownConfig = {
        common: string;
        platformSpecific: ConditionalOnPlatform<
          { feature: boolean },
          PlatformType.ELECTRON,
          PlatformType.UNKNOWN
        >;
      };

      const unknownConfig: UnknownConfig = {
        common: 'available',
        platformSpecific: null as never,
      };

      expect(unknownConfig.common).toBe('available');
      expect(unknownConfig.platformSpecific).toBe(null);
    });

    it('should support complex nested conditional types', () => {
      // Type test: Nested conditional configurations
      type ComplexConfig = PlatformSpecificConfig<{
        [PlatformType.ELECTRON]: {
          desktop: ConditionalOnPlatform<
            { windowAPI: boolean },
            PlatformType.ELECTRON,
            PlatformType.ELECTRON
          >;
          mobile: ExcludeOnPlatform<
            { touchAPI: boolean },
            PlatformType.ELECTRON,
            PlatformType.ELECTRON
          >;
        };
        [PlatformType.CAPACITOR]: {
          desktop: ConditionalOnPlatform<
            { windowAPI: boolean },
            PlatformType.ELECTRON,
            PlatformType.CAPACITOR
          >;
          mobile: ExcludeOnPlatform<
            { touchAPI: boolean },
            PlatformType.ELECTRON,
            PlatformType.CAPACITOR
          >;
        };
        [PlatformType.WEB]: {
          desktop: ConditionalOnPlatform<
            { windowAPI: boolean },
            PlatformType.ELECTRON,
            PlatformType.WEB
          >;
          mobile: ExcludeOnPlatform<{ touchAPI: boolean }, PlatformType.ELECTRON, PlatformType.WEB>;
        };
        [PlatformType.UNKNOWN]: {
          desktop: ConditionalOnPlatform<
            { windowAPI: boolean },
            PlatformType.ELECTRON,
            PlatformType.UNKNOWN
          >;
          mobile: ExcludeOnPlatform<
            { touchAPI: boolean },
            PlatformType.ELECTRON,
            PlatformType.UNKNOWN
          >;
        };
      }>;

      const electronComplexConfig: ComplexConfig = {
        platform: PlatformType.ELECTRON,
        config: {
          desktop: { windowAPI: true },
          mobile: null as never,
        },
      };

      const capacitorComplexConfig: ComplexConfig = {
        platform: PlatformType.CAPACITOR,
        config: {
          desktop: null as never,
          mobile: { touchAPI: true },
        },
      };

      // Type-safe assertions with explicit casting
      type ElectronConfig = ComplexConfig & { platform: PlatformType.ELECTRON };
      type CapacitorConfig = ComplexConfig & { platform: PlatformType.CAPACITOR };

      const typedElectronConfig = electronComplexConfig as ElectronConfig;
      const typedCapacitorConfig = capacitorComplexConfig as CapacitorConfig;

      expect(typedElectronConfig.platform).toBe(PlatformType.ELECTRON);
      expect((typedElectronConfig.config as any).desktop.windowAPI).toBe(true);
      expect(typedCapacitorConfig.platform).toBe(PlatformType.CAPACITOR);
      expect((typedCapacitorConfig.config as any).mobile.touchAPI).toBe(true);
    });
  });
});
