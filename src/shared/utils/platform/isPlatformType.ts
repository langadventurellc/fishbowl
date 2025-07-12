/**
 * Platform Type Guard
 *
 * Generic type guard function that checks if the current runtime environment
 * matches a specific platform type and provides TypeScript type narrowing.
 * Integrates with the existing platform detection system for consistent behavior.
 */

import { PlatformType } from '../../constants/platform/PlatformType';
import { detectPlatformType } from './detectPlatformType';
import { PlatformTypeSchema } from '../../types/validation/platformSchema/PlatformTypeSchema';

/**
 * Type guard that checks if the current environment matches a specific platform type
 *
 * This function serves as a TypeScript type guard, allowing for safe type narrowing
 * based on platform type checking. It integrates with the existing platform detection
 * system and includes input validation for security.
 *
 * @param targetPlatform - The platform type to check against
 * @returns True if the current environment matches the target platform type
 *
 * @example
 * ```typescript
 * // Check for specific platform
 * if (isPlatformType(PlatformType.ELECTRON)) {
 *   // TypeScript knows this is Electron environment
 *   console.log('Running in Electron');
 * }
 *
 * // Use with conditional logic
 * const platform = PlatformType.WEB;
 * if (isPlatformType(platform)) {
 *   // Platform-specific code
 *   console.log(`Confirmed running on ${platform}`);
 * }
 * ```
 *
 * @throws Never throws - uses safe fallback for any detection or validation errors
 */
export function isPlatformType(targetPlatform: PlatformType): targetPlatform is PlatformType {
  try {
    // Validate input to ensure security
    const validatedPlatform = PlatformTypeSchema.parse(targetPlatform);

    // Get current platform type
    const currentPlatform = detectPlatformType();

    // Return true if platforms match
    return currentPlatform === validatedPlatform;
  } catch {
    // Safe fallback for any validation or detection errors
    return false;
  }
}
