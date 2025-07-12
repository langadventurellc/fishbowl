/**
 * Platform Type Detection
 *
 * Main platform detection function that returns a standardized PlatformType enum
 * value based on the current runtime environment.
 */

import { PlatformType } from '../../constants/platform/PlatformType';
import { isElectronPlatform } from './isElectronPlatform';
import { isCapacitorPlatform } from './isCapacitorPlatform';
import { isWebPlatform } from './isWebPlatform';

/**
 * Detects the current platform type
 *
 * Performs platform detection checks in priority order (Electron, Capacitor, Web)
 * and returns the appropriate PlatformType enum value. This is the main function
 * for standardized platform detection throughout the application.
 *
 * @returns PlatformType enum value representing the current platform
 *
 * @example
 * ```typescript
 * const platform = detectPlatformType();
 * switch (platform) {
 *   case PlatformType.ELECTRON:
 *     // Electron-specific logic
 *     break;
 *   case PlatformType.CAPACITOR:
 *     // Capacitor-specific logic
 *     break;
 *   case PlatformType.WEB:
 *     // Web-specific logic
 *     break;
 *   default:
 *     // Unknown platform fallback
 *     break;
 * }
 * ```
 */
export function detectPlatformType(): PlatformType {
  try {
    // Check Electron first (highest priority)
    if (isElectronPlatform()) {
      return PlatformType.ELECTRON;
    }

    // Check Capacitor second
    if (isCapacitorPlatform()) {
      return PlatformType.CAPACITOR;
    }

    // Check Web third
    if (isWebPlatform()) {
      return PlatformType.WEB;
    }

    // Unknown/unsupported platform
    return PlatformType.UNKNOWN;
  } catch {
    // Safe fallback for any detection errors
    return PlatformType.UNKNOWN;
  }
}
