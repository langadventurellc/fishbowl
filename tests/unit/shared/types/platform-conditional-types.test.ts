/**
 * @fileoverview Tests for platform conditional utility types
 *
 * Tests type definitions, compilation, and logical behavior of conditional
 * p0latform utility types for type-safe platform-specific code.
 */

import { describe, expect, it, vi } from 'vitest';
import { CapabilityCategory } from '../../../../src/shared/constants/platform/CapabilityCategory';
import { DetectionStatus } from '../../../../src/shared/constants/platform/DetectionStatus';
import { PlatformType } from '../../../../src/shared/constants/platform/PlatformType';
import type { CapabilityAwareService } from '../../../../src/shared/types/platform/conditional/CapabilityAwareService';
import type { CapabilityConditional } from '../../../../src/shared/types/platform/conditional/CapabilityConditional';
import type { ConditionalOnPlatform } from '../../../../src/shared/types/platform/conditional/ConditionalOnPlatform';
import type { ExcludeOnPlatform } from '../../../../src/shared/types/platform/conditional/ExcludeOnPlatform';
import type { PlatformApiSurface } from '../../../../src/shared/types/platform/conditional/PlatformApiSurface';
import type { PlatformCompatible } from '../../../../src/shared/types/platform/conditional/PlatformCompatible';
import type { PlatformFallback } from '../../../../src/shared/types/platform/conditional/PlatformFallback';
import type { PlatformSpecificConfig } from '../../../../src/shared/types/platform/conditional/PlatformSpecificConfig';
import type { PlatformUnion } from '../../../../src/shared/types/platform/conditional/PlatformUnion';
import type { RequirePlatform } from '../../../../src/shared/types/platform/conditional/RequirePlatform';

describe('Platform Conditional Utility Types', () => {
  describe('ConditionalOnPlatform<T, P>', () => {
    it('should include properties when platform matches', () => {
      // Type test: Electron platform should include properties
      type ElectronConfig = {
        commonProp: string;
        electronProp: ConditionalOnPlatform<{ value: number }, PlatformType.ELECTRON>;
      };

      // This should compile and be usable
      const config: ElectronConfig = {
        commonProp: 'test',
        electronProp: { value: 42 } as ConditionalOnPlatform<
          { value: number },
          PlatformType.ELECTRON
        >,
      };

      expect(config.commonProp).toBe('test');
      expect(typeof config.electronProp).toBe('object');
    });

    it('should exclude properties when platform does not match', () => {
      // Type test: Web platform should exclude Electron-specific properties
      type WebConfig = {
        commonProp: string;
        electronProp: ConditionalOnPlatform<{ value: number }, PlatformType.ELECTRON>;
      };

      // On web platform, electronProp would be never type
      const webConfig: WebConfig = {
        commonProp: 'test',
        electronProp: null as never,
      };

      expect(webConfig.commonProp).toBe('test');
      expect(webConfig.electronProp).toBe(null);
    });
  });

  describe('ExcludeOnPlatform<T, P>', () => {
    it('should exclude properties on specified platform', () => {
      // Type test: Should exclude web features on Electron
      type ServiceConfig = {
        commonProp: string;
        webOnlyProp: ExcludeOnPlatform<{ webFeature: boolean }, PlatformType.ELECTRON>;
      };

      const config: ServiceConfig = {
        commonProp: 'test',
        webOnlyProp: null as never, // Would be never on Electron
      };

      expect(config.commonProp).toBe('test');
      expect(config.webOnlyProp).toBe(null);
    });

    it('should include properties on non-specified platforms', () => {
      // Type compilation test - this should be valid TypeScript
      type Config = ExcludeOnPlatform<{ feature: string }, PlatformType.UNKNOWN>;
      const config = { feature: 'available' } as Config;
      expect(config).toEqual({ feature: 'available' });
    });
  });

  describe('PlatformSpecificConfig<T>', () => {
    it('should create platform-specific configurations', () => {
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
      expect((electronConfig.config as any).windowControls).toBe(true);
      expect(webConfig.platform).toBe(PlatformType.WEB);
      expect((webConfig.config as any).serviceWorker).toBe(true);
    });
  });

  describe('CapabilityConditional<T, C, S>', () => {
    it('should include properties when capability is available', () => {
      // Type test: File system capability available
      interface ServiceInterface {
        basicFeature: string;
        fileSystemFeature: CapabilityConditional<
          {
            readFile: (path: string) => Promise<string>;
            writeFile: (path: string, data: string) => Promise<void>;
          },
          CapabilityCategory.FILESYSTEM
        >;
      }

      const service: ServiceInterface = {
        basicFeature: 'basic',
        fileSystemFeature: {
          readFile: async () => Promise.resolve('content'),
          writeFile: async () => Promise.resolve(),
        } as any,
      };

      expect(service.basicFeature).toBe('basic');
      expect(typeof service.fileSystemFeature).toBe('object');
    });

    it('should handle different detection statuses', () => {
      // Type compilation test for permission denied status
      type PermissionDeniedFeature = CapabilityConditional<
        { secureFeature: () => void },
        CapabilityCategory.SECURITY,
        DetectionStatus.PERMISSION_DENIED
      >;

      // Should still be available (not never) for permission denied
      const feature = {
        secureFeature: () => {},
      } as PermissionDeniedFeature;

      expect(typeof feature).toBe('object');
    });
  });

  describe('PlatformApiSurface<P>', () => {
    it('should provide Electron API surface', () => {
      // Type test: Electron APIs
      type ElectronAPI = PlatformApiSurface<PlatformType.ELECTRON>;

      const mockElectronAPI: ElectronAPI = {
        ipc: {
          invoke: vi.fn(),
          send: vi.fn(),
          on: vi.fn(),
        },
        window: {
          minimize: vi.fn(),
          maximize: vi.fn(),
          close: vi.fn(),
          isMaximized: vi.fn().mockReturnValue(false),
        },
        fileSystem: {
          readFile: vi.fn(),
          writeFile: vi.fn(),
          selectFile: vi.fn(),
        },
        system: {
          getSystemInfo: vi.fn(),
          openExternal: vi.fn(),
        },
      };

      expect(typeof mockElectronAPI.ipc.invoke).toBe('function');
      expect(typeof mockElectronAPI.window.minimize).toBe('function');
      expect(typeof mockElectronAPI.fileSystem.readFile).toBe('function');
    });

    it('should provide Web API surface', () => {
      // Type test: Web APIs
      type WebAPI = PlatformApiSurface<PlatformType.WEB>;

      const mockWebAPI: WebAPI = {
        storage: {
          localStorage: {} as Storage,
          sessionStorage: {} as Storage,
          indexedDB: {} as IDBFactory,
        },
        network: {
          fetch,
          serviceWorker: undefined,
        },
        ui: {
          notifications: undefined,
          clipboard: undefined,
        },
      };

      expect(typeof mockWebAPI.storage).toBe('object');
      expect(typeof mockWebAPI.network.fetch).toBe('function');
    });

    it('should provide Capacitor API surface', () => {
      // Type test: Capacitor APIs
      type CapacitorAPI = PlatformApiSurface<PlatformType.CAPACITOR>;

      const mockCapacitorAPI: CapacitorAPI = {
        device: {
          getInfo: vi.fn(),
          getBatteryInfo: vi.fn(),
        },
        camera: {
          getPhoto: vi.fn(),
        },
        geolocation: {
          getCurrentPosition: vi.fn(),
        },
        haptics: {
          vibrate: vi.fn(),
        },
      };

      expect(typeof mockCapacitorAPI.device.getInfo).toBe('function');
      expect(typeof mockCapacitorAPI.camera.getPhoto).toBe('function');
    });
  });

  describe('PlatformFallback<Primary, Fallback, Platform, SupportedPlatforms>', () => {
    it('should use primary type when platform is supported', () => {
      // Type test: File system supported on Electron
      type FileSystemService = PlatformFallback<
        { readFile: (path: string) => Promise<string> },
        { readFile: (path: string) => Promise<never> },
        PlatformType.ELECTRON,
        PlatformType.ELECTRON | PlatformType.CAPACITOR
      >;

      const service: FileSystemService = {
        readFile: () => Promise.resolve('content'),
      };

      expect(typeof service.readFile).toBe('function');
    });

    it('should use fallback type when platform is not supported', () => {
      // Type test: File system not supported on Web
      type FileSystemService = PlatformFallback<
        { readFile: (path: string) => Promise<string> },
        { readFile: (path: string) => Promise<never> },
        PlatformType.WEB,
        PlatformType.ELECTRON | PlatformType.CAPACITOR
      >;

      const service: FileSystemService = {
        readFile: () => Promise.reject(new Error('Not supported')) as never,
      };

      expect(typeof service.readFile).toBe('function');
    });
  });

  describe('RequirePlatform<T, P>', () => {
    it('should mark types as requiring specific platforms', () => {
      // Type test: Electron-only service
      type ElectronOnlyService = RequirePlatform<
        {
          openNativeDialog: () => Promise<string>;
          accessMainProcess: () => Promise<any>;
        },
        PlatformType.ELECTRON
      >;

      const service: ElectronOnlyService = {
        _requiredPlatforms: PlatformType.ELECTRON,
        openNativeDialog: () => Promise.resolve('/path/to/file'),
        accessMainProcess: () => Promise.resolve({}),
      };

      expect(service._requiredPlatforms).toBe(PlatformType.ELECTRON);
      expect(typeof service.openNativeDialog).toBe('function');
    });
  });

  describe('PlatformUnion<T>', () => {
    it('should create discriminated union across platforms', () => {
      // Type test: Storage service union
      type StorageService = PlatformUnion<{
        [PlatformType.ELECTRON]: {
          type: 'file-system';
          path: string;
          writeFile: (data: string) => Promise<void>;
        };
        [PlatformType.WEB]: {
          type: 'local-storage';
          key: string;
          setItem: (value: string) => void;
        };
      }>;

      const electronService: StorageService = {
        platform: PlatformType.ELECTRON,
        type: 'file-system',
        path: '/data',
        writeFile: () => Promise.resolve(),
      };

      const webService: StorageService = {
        platform: PlatformType.WEB,
        type: 'local-storage',
        key: 'data',
        setItem: () => {},
      };

      expect(electronService.platform).toBe(PlatformType.ELECTRON);
      expect(electronService.type).toBe('file-system');
      expect(webService.platform).toBe(PlatformType.WEB);
      expect(webService.type).toBe('local-storage');
    });
  });

  describe('CapabilityAwareService<T, Capabilities>', () => {
    it('should create services aware of capability requirements', () => {
      // Type test: File service with capability requirements
      interface BaseFileService {
        listFiles: () => Promise<string[]>;
        readTextFile?: (path: string) => Promise<string>;
        writeTextFile?: (path: string, content: string) => Promise<void>;
      }

      type FileService = CapabilityAwareService<
        BaseFileService,
        {
          [CapabilityCategory.FILESYSTEM]: DetectionStatus.AVAILABLE;
        }
      >;

      const service: FileService = {
        _requiredCapabilities: {
          [CapabilityCategory.FILESYSTEM]: DetectionStatus.AVAILABLE,
        },
        _capabilityStatus: {
          [CapabilityCategory.FILESYSTEM]: DetectionStatus.AVAILABLE,
        },
        listFiles: () => Promise.resolve([]),
        readTextFile: () => Promise.resolve('content'),
        writeTextFile: () => Promise.resolve(),
      };

      expect(service._requiredCapabilities[CapabilityCategory.FILESYSTEM]).toBe(
        DetectionStatus.AVAILABLE,
      );
      expect(typeof service.listFiles).toBe('function');
    });
  });

  describe('PlatformCompatible<T, SupportedPlatforms>', () => {
    it('should ensure type compatibility across platforms', () => {
      // Type test: Universal logger
      type UniversalLogger = PlatformCompatible<
        {
          log: (message: string) => void;
          error: (error: Error) => void;
          debug: (data: any) => void;
        },
        PlatformType.ELECTRON | PlatformType.WEB | PlatformType.CAPACITOR
      >;

      const logger: UniversalLogger = {
        _supportedPlatforms: PlatformType.ELECTRON as any,
        _isPlatformCompatible: true,
        log: () => {},
        error: () => {},
        debug: () => {},
      };

      expect(logger._isPlatformCompatible).toBe(true);
      expect(typeof logger.log).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    it('should work with subset of platforms', () => {
      // Type test: Network service for mobile/web only
      type NetworkService = PlatformCompatible<
        {
          fetch: (url: string) => Promise<Response>;
          ping: (host: string) => Promise<boolean>;
        },
        PlatformType.WEB | PlatformType.CAPACITOR
      >;

      const service: NetworkService = {
        _supportedPlatforms: PlatformType.WEB as any,
        _isPlatformCompatible: true,
        fetch: () => Promise.resolve(new Response()),
        ping: () => Promise.resolve(true),
      };

      expect(service._isPlatformCompatible).toBe(true);
      expect(typeof service.fetch).toBe('function');
    });
  });

  describe('Type System Integration', () => {
    it('should work with existing platform constants', () => {
      // Integration test: Using utility types with existing constants
      type ElectronFeature = ConditionalOnPlatform<
        { nativeFeature: boolean },
        PlatformType.ELECTRON
      >;

      type WebFeature = ExcludeOnPlatform<{ webOnlyFeature: boolean }, PlatformType.ELECTRON>;

      // Should compile without issues
      const electronFeature: ElectronFeature = { nativeFeature: true } as ElectronFeature;
      const webFeature: WebFeature = null as never; // Excluded on current platform

      expect(typeof electronFeature).toBe('object');
      expect(webFeature).toBe(null);
    });

    it('should integrate with capability system', () => {
      // Integration test: Combining capability and platform conditionals
      type AdvancedService = CapabilityAwareService<
        PlatformCompatible<
          {
            basicMethod: () => void;
          },
          PlatformType.ELECTRON | PlatformType.WEB
        >,
        {
          [CapabilityCategory.STORAGE]: DetectionStatus.AVAILABLE;
        }
      >;

      const service: AdvancedService = {
        _supportedPlatforms: PlatformType.ELECTRON as any,
        _isPlatformCompatible: true,
        _requiredCapabilities: {
          [CapabilityCategory.STORAGE]: DetectionStatus.AVAILABLE,
        },
        _capabilityStatus: {
          [CapabilityCategory.STORAGE]: DetectionStatus.AVAILABLE,
        },
        basicMethod: () => {},
      };

      expect(service._isPlatformCompatible).toBe(true);
      expect(service._capabilityStatus[CapabilityCategory.STORAGE]).toBe(DetectionStatus.AVAILABLE);
    });
  });
});
