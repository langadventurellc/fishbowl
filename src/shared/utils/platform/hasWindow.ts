/**
 * Safe Window Object Access
 *
 * Provides type-safe check for window object availability
 * without triggering TypeScript strict mode violations.
 */

/**
 * Safely checks if window object exists
 *
 * @returns True if window object is available
 */
export function hasWindow(): boolean {
  try {
    return (
      typeof globalThis !== 'undefined' &&
      typeof (globalThis as Record<string, unknown>).window === 'object' &&
      (globalThis as Record<string, unknown>).window !== null
    );
  } catch {
    return false;
  }
}
