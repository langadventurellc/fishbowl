/**
 * Safe Window Property Access
 *
 * Provides type-safe access to window object properties
 * without triggering TypeScript strict mode violations.
 */

/**
 * Safely checks if a property exists on the global window object
 *
 * @param propertyName - The property name to check
 * @returns True if the property exists on window
 */
export function hasWindowProperty(propertyName: string): boolean {
  try {
    if (typeof globalThis === 'undefined') {
      return false;
    }

    const globalWindow = (globalThis as Record<string, unknown>).window;
    if (typeof globalWindow !== 'object' || globalWindow === null) {
      return false;
    }

    return propertyName in globalWindow;
  } catch {
    return false;
  }
}
