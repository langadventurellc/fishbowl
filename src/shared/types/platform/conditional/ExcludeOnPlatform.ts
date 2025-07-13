import { PlatformType } from '../../../constants/platform/PlatformType';

/**
 * Utility type that excludes properties when on a specific platform type.
 * Properties are available on all platforms except the specified one.
 *
 * This type creates a conditional property that is excluded when the runtime platform
 * matches the specified platform type. The type evaluates to `never` when the platform
 * matches and `T` when it doesn't, allowing for proper type narrowing at runtime.
 *
 * @template T - The base type containing properties
 * @template P - The platform type to exclude properties on
 * @template Current - The current platform type (defaults to all platforms for union type)
 *
 * @example
 * ```typescript
 * import { isPlatformType } from '../../utils/platform/isPlatformType';
 * import { detectPlatformType } from '../../utils/platform/detectPlatformType';
 *
 * interface ServiceConfig {
 *   commonProp: string;
 *   nonElectronProp: ExcludeOnPlatform<{ webFeature: boolean }, PlatformType.ELECTRON>;
 * }
 *
 * // Runtime usage with type guard
 * function useConfig(config: ServiceConfig) {
 *   // Always available
 *   console.log(config.commonProp);
 *
 *   // Only available on non-Electron platforms
 *   if (!isPlatformType(undefined, PlatformType.ELECTRON)) {
 *     // TypeScript knows nonElectronProp is available here
 *     console.log(config.nonElectronProp.webFeature);
 *   }
 * }
 *
 * // Runtime platform detection
 * const currentPlatform = detectPlatformType();
 * if (currentPlatform !== PlatformType.ELECTRON) {
 *   // nonElectronProp is available
 * }
 * ```
 */
export type ExcludeOnPlatform<
  T,
  P extends PlatformType,
  Current extends PlatformType = PlatformType,
> = Current extends P ? never : T;
