import { PlatformType } from '../../../constants/platform/PlatformType';

// Web API interfaces for cross-platform compatibility
interface WebStorage {
  length: number;
  clear(): void;
  getItem(key: string): string | null;
  key(index: number): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

interface WebIDBFactory {
  open(name: string, version?: number): unknown;
  deleteDatabase(name: string): unknown;
  databases?(): Promise<unknown[]>;
}

interface WebServiceWorkerContainer {
  ready: Promise<unknown>;
  controller: unknown;
  register(scriptURL: string, options?: Record<string, unknown>): Promise<unknown>;
}

interface WebNotification {
  new (title: string, options?: Record<string, unknown>): unknown;
  permission: string;
  requestPermission(): Promise<string>;
}

interface WebClipboard {
  read(): Promise<unknown>;
  readText(): Promise<string>;
  write(data: unknown): Promise<void>;
  writeText(data: string): Promise<void>;
}

interface WebFetch {
  (input: string, init?: Record<string, unknown>): Promise<unknown>;
}

/**
 * Utility type that defines the API surface available for a specific platform.
 * This provides compile-time safety for platform-specific API usage.
 *
 * @template P - The platform type to get the API surface for
 *
 * @example
 * ```typescript
 * type ElectronAPI = PlatformApiSurface<PlatformType.ELECTRON>;
 * // Includes: window management, native dialogs, file system, etc.
 *
 * type WebAPI = PlatformApiSurface<PlatformType.WEB>;
 * // Includes: service workers, web storage, fetch, etc.
 *
 * type CapacitorAPI = PlatformApiSurface<PlatformType.CAPACITOR>;
 * // Includes: device plugins, camera, geolocation, etc.
 * ```
 */
export type PlatformApiSurface<P extends PlatformType> = P extends PlatformType.ELECTRON
  ? {
      ipc: {
        invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
        send: (channel: string, ...args: unknown[]) => void;
        on: (channel: string, listener: (...args: unknown[]) => void) => void;
      };
      window: {
        minimize: () => void;
        maximize: () => void;
        close: () => void;
        isMaximized: () => boolean;
      };
      fileSystem: {
        readFile: (path: string) => Promise<string>;
        writeFile: (path: string, data: string) => Promise<void>;
        selectFile: () => Promise<string | null>;
      };
      system: {
        getSystemInfo: () => Promise<Record<string, unknown>>;
        openExternal: (url: string) => Promise<void>;
      };
    }
  : P extends PlatformType.WEB
    ? {
        storage: {
          localStorage: WebStorage;
          sessionStorage: WebStorage;
          indexedDB: WebIDBFactory;
        };
        network: {
          fetch: WebFetch;
          serviceWorker: WebServiceWorkerContainer | undefined;
        };
        ui: {
          notifications: WebNotification | undefined;
          clipboard: WebClipboard | undefined;
        };
      }
    : P extends PlatformType.CAPACITOR
      ? {
          device: {
            getInfo: () => Promise<Record<string, unknown>>;
            getBatteryInfo: () => Promise<Record<string, unknown>>;
          };
          camera: {
            getPhoto: (options: Record<string, unknown>) => Promise<Record<string, unknown>>;
          };
          geolocation: {
            getCurrentPosition: (
              options?: Record<string, unknown>,
            ) => Promise<Record<string, unknown>>;
          };
          haptics: {
            vibrate: (options?: Record<string, unknown>) => Promise<void>;
          };
        }
      : never;
