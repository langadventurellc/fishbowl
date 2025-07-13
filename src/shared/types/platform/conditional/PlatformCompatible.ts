import { PlatformType } from '../../../constants/platform/PlatformType';

/**
 * Utility type that ensures a type is compatible across specified platforms.
 * This enforces that the type works on all provided platforms without
 * platform-specific dependencies.
 *
 * @template T - The base type to make platform compatible
 * @template SupportedPlatforms - Union of platforms this type must support
 *
 * @example
 * ```typescript
 * interface UniversalLogger extends PlatformCompatible<{
 *   log: (message: string) => void;
 *   error: (error: Error) => void;
 *   debug: (data: any) => void;
 * }, PlatformType.ELECTRON | PlatformType.WEB | PlatformType.CAPACITOR> {}
 *
 * interface NetworkService extends PlatformCompatible<{
 *   fetch: (url: string) => Promise<Response>;
 *   ping: (host: string) => Promise<boolean>;
 * }, PlatformType.WEB | PlatformType.CAPACITOR> {}
 *
 * // These types must work on all specified platforms
 * ```
 */
export type PlatformCompatible<T, SupportedPlatforms extends PlatformType> = T & {
  readonly _supportedPlatforms: SupportedPlatforms;
  readonly _isPlatformCompatible: true;
};
