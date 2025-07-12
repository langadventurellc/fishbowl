/**
 * Capacitor Operating System Detection
 *
 * Gets the specific operating system when running in a Capacitor environment.
 * Returns OperatingSystem enum values for consistency with the platform detection system.
 */

import { OperatingSystem } from '../../constants/platform/OperatingSystem';
import { isCapacitorPlatform } from './isCapacitorPlatform';

/**
 * Gets the operating system when running in Capacitor environment
 *
 * Safely accesses the Capacitor platform property to determine the specific
 * operating system (iOS or Android). Returns UNKNOWN if not in Capacitor
 * environment or if the platform cannot be determined.
 *
 * @returns OperatingSystem enum value for the detected platform
 *
 * @example
 * ```typescript
 * const os = getCapacitorOperatingSystem();
 * if (os === OperatingSystem.IOS) {
 *   // iOS-specific functionality
 * } else if (os === OperatingSystem.ANDROID) {
 *   // Android-specific functionality
 * }
 * ```
 */
export function getCapacitorOperatingSystem(): OperatingSystem {
  try {
    // First ensure we're in Capacitor environment
    if (!isCapacitorPlatform()) {
      return OperatingSystem.UNKNOWN;
    }

    // Safe access to Capacitor platform property
    const globalWindow = (globalThis as Record<string, unknown>).window;
    if (typeof globalWindow !== 'object' || globalWindow === null) {
      return OperatingSystem.UNKNOWN;
    }

    const capacitor = (globalWindow as Record<string, unknown>).Capacitor;
    if (typeof capacitor !== 'object' || capacitor === null) {
      return OperatingSystem.UNKNOWN;
    }

    const platform = (capacitor as Record<string, unknown>).platform;

    // Map Capacitor platform strings to OperatingSystem enum values
    switch (platform) {
      case 'ios':
        return OperatingSystem.IOS;
      case 'android':
        return OperatingSystem.ANDROID;
      default:
        return OperatingSystem.UNKNOWN;
    }
  } catch {
    // Safe fallback if any access fails
    return OperatingSystem.UNKNOWN;
  }
}
