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
import { platformCache } from './cache';
import { hasWindow } from './hasWindow';
import { hasWindowProperty } from './hasWindowProperty';

/**
 * Detects the current platform type with caching
 *
 * Performs platform detection checks in priority order (Electron, Capacitor, Web)
 * and returns the appropriate PlatformType enum value. Results are cached for
 * optimal performance on subsequent calls.
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
    // Check cache first for optimal performance
    const cachedType = platformCache.getCachedPlatformType();
    if (cachedType !== null) {
      return cachedType;
    }

    // Perform detection if not cached
    const platformType = detectPlatformTypeUncached();

    // Cache the result for future calls
    // Note: We'll cache the full platform info when getPlatformInfo is called
    // This is a lightweight cache update for just the platform type
    if (platformType !== PlatformType.UNKNOWN) {
      const platformInfo = createMinimalPlatformInfo(platformType);
      platformCache.setCachedResults(platformType, platformInfo);
    }

    return platformType;
  } catch {
    // Safe fallback for any detection errors
    return PlatformType.UNKNOWN;
  }
}

/**
 * Performs uncached platform type detection
 *
 * Internal function that performs the actual platform detection logic
 * without any caching. Used by the main detectPlatformType function.
 *
 * @returns PlatformType enum value representing the current platform
 */
function detectPlatformTypeUncached(): PlatformType {
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

/**
 * Creates minimal platform info for caching when only platform type is detected
 *
 * @param platformType - Detected platform type
 * @returns Minimal PlatformInfo object for caching
 */
function createMinimalPlatformInfo(
  platformType: PlatformType,
): import('./PlatformInfo').PlatformInfo {
  return {
    platformType,
    detections: {
      isElectron: platformType === PlatformType.ELECTRON,
      isCapacitor: platformType === PlatformType.CAPACITOR,
      isWeb: platformType === PlatformType.WEB,
    },
    environment: {
      hasWindow: hasWindow(),
      hasElectronAPI: hasWindowProperty('electronAPI'),
      hasCapacitorAPI: hasWindowProperty('Capacitor'),
      hasNavigator: hasWindowProperty('navigator'),
    },
    timestamp: Date.now(),
  };
}
