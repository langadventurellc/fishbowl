import { PlatformType } from '../../../constants/platform/PlatformType';

/**
 * Utility type that requires specific platforms for type usage.
 * The type is only available on the specified platforms, providing
 * compile-time platform requirements.
 *
 * @template T - The base type to conditionally provide
 * @template P - Union of platform types that are required
 *
 * @example
 * ```typescript
 * interface ElectronOnlyService extends RequirePlatform<{
 *   openNativeDialog: () => Promise<string>;
 *   accessMainProcess: () => Promise<any>;
 * }, PlatformType.ELECTRON> {}
 *
 * interface MobileOnlyFeature extends RequirePlatform<{
 *   takePicture: () => Promise<string>;
 *   getDeviceInfo: () => Promise<any>;
 * }, PlatformType.CAPACITOR> {}
 *
 * // Type is only accessible when running on required platforms
 * ```
 */
export type RequirePlatform<T, P extends PlatformType> = {
  readonly _requiredPlatforms: P;
} & T;
