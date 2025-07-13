import { PlatformType } from '../../../constants/platform/PlatformType';

/**
 * Utility type that conditionally includes properties based on platform type.
 * Properties are only available when the specified platform matches.
 *
 * @template T - The base type containing properties
 * @template P - The platform type that must match
 *
 * @example
 * ```typescript
 * interface BaseConfig {
 *   commonProp: string;
 *   electronProp: ConditionalOnPlatform<{ value: number }, PlatformType.ELECTRON>;
 * }
 *
 * // On Electron: { commonProp: string; electronProp: { value: number } }
 * // On other platforms: { commonProp: string; electronProp: never }
 * ```
 */
export type ConditionalOnPlatform<T, P extends PlatformType> = P extends PlatformType ? T : never;
