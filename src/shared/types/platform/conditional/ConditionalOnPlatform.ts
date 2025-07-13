import { PlatformType } from '../../../constants/platform/PlatformType';

/**
 * Utility type that represents properties conditionally available based on platform type.
 *
 * This type creates a conditional property that is available when the runtime platform
 * matches the specified platform type. The type evaluates to `T` when the platform
 * matches and `never` when it doesn't, allowing for proper type narrowing at runtime.
 *
 * @template T - The base type containing properties
 * @template P - The specific platform type that must match
 * @template Current - The current platform type (defaults to all platforms for union type)
 *
 * @example
 * ```typescript
 * import { isPlatformType } from '../../utils/platform/isPlatformType';
 * import { detectPlatformType } from '../../utils/platform/detectPlatformType';
 *
 * interface BaseConfig {
 *   commonProp: string;
 *   electronProp: ConditionalOnPlatform<{ value: number }, PlatformType.ELECTRON>;
 * }
 *
 * // Runtime usage with type guard
 * function useConfig(config: BaseConfig) {
 *   // Always available
 *   console.log(config.commonProp);
 *
 *   // Only available on Electron platform
 *   if (isPlatformType(undefined, PlatformType.ELECTRON)) {
 *     // TypeScript knows electronProp is available here
 *     console.log(config.electronProp.value);
 *   }
 * }
 *
 * // Runtime platform detection
 * const currentPlatform = detectPlatformType();
 * if (currentPlatform === PlatformType.ELECTRON) {
 *   // electronProp is available
 * }
 * ```
 */
export type ConditionalOnPlatform<
  T,
  P extends PlatformType,
  Current extends PlatformType = PlatformType,
> = Current extends P ? T : never;
