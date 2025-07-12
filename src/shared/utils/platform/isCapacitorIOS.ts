/**
 * Capacitor iOS Platform Detection
 *
 * Detects if the current environment is running in a Capacitor iOS application.
 * Uses safe global object access patterns to check for Capacitor and iOS platform.
 */

import { isCapacitorPlatform } from './isCapacitorPlatform';

/**
 * Detects if the current environment is running in Capacitor on iOS
 *
 * First checks if we're in a Capacitor environment, then specifically
 * checks if the platform is iOS. Uses safe global object access to
 * prevent runtime errors.
 *
 * @returns True if running in Capacitor on iOS
 *
 * @example
 * ```typescript
 * if (isCapacitorIOS()) {
 *   // iOS-specific Capacitor code
 *   console.log('Running in Capacitor on iOS');
 * }
 * ```
 */
export function isCapacitorIOS(): boolean {
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
    return platform === 'ios';
  } catch {
    // Safe fallback if any access fails
    return false;
  }
}
