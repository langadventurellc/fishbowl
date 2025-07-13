import { PlatformType } from '../../../constants/platform/PlatformType';

/**
 * Utility type for creating configuration objects that have different shapes
 * based on the platform type. Each platform can have its own specific configuration
 * while maintaining type safety.
 *
 * @template T - Object mapping platform types to their specific configurations
 *
 * @example
 * ```typescript
 * type AppConfig = PlatformSpecificConfig<{
 *   [PlatformType.ELECTRON]: {
 *     windowControls: boolean;
 *     nativeMenus: boolean;
 *   };
 *   [PlatformType.WEB]: {
 *     serviceWorker: boolean;
 *     offlineMode: boolean;
 *   };
 *   [PlatformType.CAPACITOR]: {
 *     devicePlugins: string[];
 *     biometrics: boolean;
 *   };
 * }>;
 * ```
 */
export type PlatformSpecificConfig<T extends Record<PlatformType, unknown>> = {
  [K in keyof T]: {
    platform: K;
    config: T[K];
  };
}[PlatformType];
