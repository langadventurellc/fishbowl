/**
 * Known Platform Type Guard
 *
 * Type guard function that checks if the current runtime environment is a known
 * (non-unknown) platform and provides TypeScript type narrowing to exclude
 * the UNKNOWN platform type from conditional blocks.
 */

import { PlatformType } from '../../constants/platform/PlatformType';
import { detectPlatformType } from './detectPlatformType';
import type { KnownPlatformType } from '../../types/platform/KnownPlatformType';

/**
 * Type guard that checks if the current environment is a known platform
 *
 * This function serves as a TypeScript type guard, allowing for safe type narrowing
 * to exclude the UNKNOWN platform type. This is useful when you need to ensure
 * the platform is one of the supported, well-defined platform types.
 *
 * @param platform - Platform type to check (optional, uses current platform if not provided)
 * @returns True if the platform is known (not UNKNOWN) with type narrowing
 *
 * @example
 * ```typescript
 * // Check current platform
 * if (isKnownPlatform()) {
 *   // TypeScript knows platform is not UNKNOWN
 *   const platform = detectPlatformType(); // Type is KnownPlatformType
 *   console.log(`Running on known platform: ${platform}`);
 * }
 *
 * // Check specific platform
 * const detectedPlatform = detectPlatformType();
 * if (isKnownPlatform(detectedPlatform)) {
 *   // detectedPlatform is narrowed to KnownPlatformType
 *   console.log(`Confirmed known platform: ${detectedPlatform}`);
 * }
 * ```
 *
 * @throws Never throws - uses safe fallback for any detection errors
 */
export function isKnownPlatform(platform?: PlatformType): platform is KnownPlatformType {
  try {
    const platformToCheck = platform ?? detectPlatformType();
    return platformToCheck !== PlatformType.UNKNOWN;
  } catch {
    // Safe fallback for any detection errors
    return false;
  }
}
