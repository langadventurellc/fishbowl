import { PlatformType } from '../../../constants/platform/PlatformType';

/**
 * Utility type that provides fallback types when primary types are not supported
 * on a specific platform. This ensures graceful degradation at the type level.
 *
 * @template Primary - The primary type to use when supported
 * @template Fallback - The fallback type to use when primary is not supported
 * @template Platform - The platform type to check support for
 * @template SupportedPlatforms - Union of platforms that support the primary type
 *
 * @example
 * ```typescript
 * type FileSystemService = PlatformFallback<
 *   { readFile: (path: string) => Promise<string> },
 *   { readFile: (path: string) => Promise<never> },
 *   PlatformType.WEB,
 *   PlatformType.ELECTRON | PlatformType.CAPACITOR
 * >;
 *
 * // On Electron/Capacitor: Full file system service
 * // On Web: Fallback with rejected promises
 * ```
 */
export type PlatformFallback<
  Primary,
  Fallback,
  Platform extends PlatformType,
  SupportedPlatforms extends PlatformType,
> = Platform extends SupportedPlatforms ? Primary : Fallback;
