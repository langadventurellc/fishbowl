/**
 * Capacitor Android Platform Detection
 *
 * Detects if the current environment is running in a Capacitor Android application.
 * Uses safe global object access patterns to check for Capacitor and Android platform.
 */

import { isCapacitorPlatform } from './isCapacitorPlatform';

/**
 * Detects if the current environment is running in Capacitor on Android
 *
 * First checks if we're in a Capacitor environment, then specifically
 * checks if the platform is Android. Uses safe global object access to
 * prevent runtime errors.
 *
 * @returns True if running in Capacitor on Android
 *
 * @example
 * ```typescript
 * if (isCapacitorAndroid()) {
 *   // Android-specific Capacitor code
 *   console.log('Running in Capacitor on Android');
 * }
 * ```
 */
export function isCapacitorAndroid(): boolean {
  try {
    // First ensure we're in Capacitor environment
    if (!isCapacitorPlatform()) {
      return false;
    }

    // Safe access to Capacitor platform property
    const globalWindow = (globalThis as Record<string, unknown>).window;
    if (typeof globalWindow !== 'object' || globalWindow === null) {
      return false;
    }

    const capacitor = (globalWindow as Record<string, unknown>).Capacitor;
    if (typeof capacitor !== 'object' || capacitor === null) {
      return false;
    }

    const platform = (capacitor as Record<string, unknown>).platform;
    return platform === 'android';
  } catch {
    // Safe fallback if any access fails
    return false;
  }
}
