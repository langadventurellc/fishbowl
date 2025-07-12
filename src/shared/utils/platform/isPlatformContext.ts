/**
 * Platform Context Type Guard
 *
 * Type guard function that checks if an object contains valid platform context
 * information and provides TypeScript type narrowing for platform context objects.
 * Useful for validating and narrowing platform detection results.
 */

import type { PlatformContextType } from '../../types/platform/PlatformContextType';
import { PlatformTypeSchema } from '../../types/validation/platformSchema/PlatformTypeSchema';

/**
 * Type guard that checks if an object is a valid platform context
 *
 * This function serves as a TypeScript type guard for validating platform context
 * objects. It performs comprehensive validation to ensure the object contains
 * all required platform information with correct types.
 *
 * @param obj - Object to check for platform context validity
 * @returns True if object is valid platform context with type narrowing
 *
 * @example
 * ```typescript
 * // Validate platform detection result
 * const result = getPlatformInfo();
 * if (isPlatformContext(result)) {
 *   // result is narrowed to PlatformContext
 *   console.log(`Platform: ${result.platformType}`);
 *   console.log(`Has Electron API: ${result.environment.hasElectronAPI}`);
 * }
 *
 * // Safe type checking for unknown objects
 * function processPlatformData(data: unknown) {
 *   if (isPlatformContext(data)) {
 *     // TypeScript knows data is PlatformContext
 *     return data.platformType;
 *   }
 *   throw new Error('Invalid platform context');
 * }
 * ```
 *
 * @throws Never throws - uses safe validation with fallback
 */
export function isPlatformContext(obj: unknown): obj is PlatformContextType {
  try {
    // Check if obj is an object
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    const candidate = obj as Record<string, unknown>;

    // Validate platformType
    if (!PlatformTypeSchema.safeParse(candidate.platformType).success) {
      return false;
    }

    // Validate detections object
    if (typeof candidate.detections !== 'object' || candidate.detections === null) {
      return false;
    }

    const detections = candidate.detections as Record<string, unknown>;
    if (
      typeof detections.isElectron !== 'boolean' ||
      typeof detections.isCapacitor !== 'boolean' ||
      typeof detections.isWeb !== 'boolean'
    ) {
      return false;
    }

    // Validate environment object
    if (typeof candidate.environment !== 'object' || candidate.environment === null) {
      return false;
    }

    const environment = candidate.environment as Record<string, unknown>;
    if (
      typeof environment.hasWindow !== 'boolean' ||
      typeof environment.hasElectronAPI !== 'boolean' ||
      typeof environment.hasCapacitorAPI !== 'boolean' ||
      typeof environment.hasNavigator !== 'boolean'
    ) {
      return false;
    }

    // Validate timestamp
    return !(
      typeof candidate.timestamp !== 'number' ||
      !Number.isInteger(candidate.timestamp) ||
      candidate.timestamp <= 0
    );
  } catch {
    // Safe fallback for any validation errors
    return false;
  }
}
