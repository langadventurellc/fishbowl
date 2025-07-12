/**
 * Capacitor Platform Detection
 *
 * Detects if the current environment is running in a Capacitor mobile application.
 * Uses safe global object access patterns to check for the Capacitor API.
 */

import { hasWindowProperty } from './hasWindowProperty';

/**
 * Detects if the current environment is running in Capacitor
 *
 * Checks for the presence of window.Capacitor which indicates
 * the application is running in a Capacitor mobile environment.
 * Uses safe global object access to prevent runtime errors.
 *
 * @returns True if running in Capacitor environment
 *
 * @example
 * ```typescript
 * if (isCapacitorPlatform()) {
 *   // Capacitor-specific code
 *   console.log('Running in Capacitor mobile app');
 * }
 * ```
 */
export function isCapacitorPlatform(): boolean {
  try {
    return hasWindowProperty('Capacitor');
  } catch {
    // Safe fallback if window access fails
    return false;
  }
}
