/**
 * Safe Window Property Access
 *
 * Provides type-safe access to window object properties
 * without triggering TypeScript strict mode violations.
 * Includes input validation to prevent security vulnerabilities.
 */

import { WindowPropertyNameSchema } from '../../types/validation/platformSchema/WindowPropertyNameSchema';

/**
 * Safely checks if a property exists on the global window object
 *
 * @param propertyName - The property name to check (validated for security)
 * @returns True if the property exists on window
 * @throws ZodError if propertyName is invalid or potentially dangerous
 */
export function hasWindowProperty(propertyName: string): boolean {
  try {
    // Validate input for security and prevent injection attacks
    const validatedPropertyName = WindowPropertyNameSchema.parse(propertyName);

    if (typeof globalThis === 'undefined') {
      return false;
    }

    const globalWindow = (globalThis as Record<string, unknown>).window;
    if (typeof globalWindow !== 'object' || globalWindow === null) {
      return false;
    }

    return validatedPropertyName in globalWindow;
  } catch {
    // If validation fails, return false rather than throwing
    // This provides a safe fallback for platform detection
    return false;
  }
}
