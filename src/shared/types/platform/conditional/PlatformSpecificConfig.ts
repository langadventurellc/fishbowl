import { PlatformType } from '../../../constants/platform/PlatformType';

/**
 * Utility type for creating configuration objects that have different shapes
 * based on the platform type. Each platform can have its own specific configuration
 * while maintaining type safety and working with runtime platform detection.
 *
 * This type creates a discriminated union where each variant contains the platform
 * identifier and its specific configuration. Works seamlessly with runtime platform
 * detection for proper type narrowing and configuration selection.
 *
 * @template T - Object mapping platform types to their specific configurations
 *
 * @example
 * ```typescript
 * import { detectPlatformType } from '../../utils/platform/detectPlatformType';
 * import { isPlatformType } from '../../utils/platform/isPlatformType';
 *
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
 *
 * // Runtime configuration selection
 * function createPlatformConfig(): AppConfig {
 *   const currentPlatform = detectPlatformType();
 *
 *   switch (currentPlatform) {
 *     case PlatformType.ELECTRON:
 *       return {
 *         platform: PlatformType.ELECTRON,
 *         config: { windowControls: true, nativeMenus: false }
 *       };
 *     case PlatformType.WEB:
 *       return {
 *         platform: PlatformType.WEB,
 *         config: { serviceWorker: true, offlineMode: false }
 *       };
 *     case PlatformType.CAPACITOR:
 *       return {
 *         platform: PlatformType.CAPACITOR,
 *         config: { devicePlugins: ['camera'], biometrics: true }
 *       };
 *     default:
 *       throw new Error(`Unsupported platform: ${currentPlatform}`);
 *   }
 * }
 *
 * // Type-safe configuration usage
 * function useConfig(config: AppConfig) {
 *   if (config.platform === PlatformType.ELECTRON) {
 *     // TypeScript knows config.config has windowControls and nativeMenus
 *     console.log('Window controls:', config.config.windowControls);
 *   }
 * }
 * ```
 */
export type PlatformSpecificConfig<T extends Record<PlatformType, unknown>> = {
  [K in keyof T]: {
    platform: K;
    config: T[K];
  };
}[PlatformType];
