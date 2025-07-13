/**
 * Platform Type Guard
 *
 * Generic type guard function that checks if a runtime environment context
 * matches a specific platform type and provides meaningful TypeScript type narrowing.
 * Integrates with the existing platform detection system for consistent behavior.
 */

import { PlatformType } from '../../constants/platform/PlatformType';
import { detectPlatformType } from './detectPlatformType';
import { PlatformTypeSchema } from '../../types/validation/platformSchema/PlatformTypeSchema';
import type { AllPlatformEnvironment } from '../../types/platform/AllPlatformEnvironment';
import type { PlatformEnvironmentMap } from '../../types/platform/PlatformEnvironmentMap';

/**
 * Type guard that checks if an environment context matches a specific platform type
 *
 * This function serves as a TypeScript type guard, allowing for safe type narrowing
 * based on platform type checking. It provides meaningful TypeScript type narrowing
 * by mapping platform types to their corresponding environment interfaces.
 *
 * @param context - Runtime environment context (optional, uses current environment if not provided)
 * @param targetPlatform - The platform type to check against
 * @returns True if the environment matches the target platform type
 *
 * @example
 * ```typescript
 * // Check current environment for specific platform
 * if (isPlatformType(undefined, PlatformType.ELECTRON)) {
 *   // TypeScript knows this is Electron environment
 *   console.log('Running in Electron');
 * }
 *
 * // Check specific context for platform type
 * const context = getCurrentEnvironmentContext();
 * if (isPlatformType(context, PlatformType.WEB)) {
 *   // context is narrowed to WebEnvironment
 *   console.log(`Running on ${context.platform} with DOM: ${context.hasDOM}`);
 * }
 * ```
 *
 * @throws Never throws - uses safe fallback for any detection or validation errors
 */
export function isPlatformType<T extends PlatformType>(
  context: AllPlatformEnvironment | undefined,
  targetPlatform: T,
): context is PlatformEnvironmentMap[T] {
  try {
    // Validate input to ensure security
    const validatedPlatform = PlatformTypeSchema.parse(targetPlatform);

    // If context is provided, check its platform property
    if (context && typeof context === 'object' && 'platform' in context) {
      return context.platform === validatedPlatform;
    }

    // Fallback to current platform detection
    const currentPlatform = detectPlatformType();
    return currentPlatform === validatedPlatform;
  } catch {
    // Safe fallback for any validation or detection errors
    return false;
  }
}
