import { PlatformType } from '../../../constants/platform/PlatformType';

/**
 * Utility type that excludes properties when on a specific platform type.
 * Properties are available on all platforms except the specified one.
 *
 * @template T - The base type containing properties
 * @template P - The platform type to exclude properties on
 *
 * @example
 * ```typescript
 * interface ServiceConfig {
 *   commonProp: string;
 *   nonElectronProp: ExcludeOnPlatform<{ webFeature: boolean }, PlatformType.ELECTRON>;
 * }
 *
 * // On Electron: { commonProp: string; nonElectronProp: never }
 * // On Web/Capacitor: { commonProp: string; nonElectronProp: { webFeature: boolean } }
 * ```
 */
export type ExcludeOnPlatform<T, P extends PlatformType> = P extends PlatformType ? never : T;
