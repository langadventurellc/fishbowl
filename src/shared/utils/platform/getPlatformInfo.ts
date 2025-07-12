/**
 * Enhanced Platform Information
 *
 * Provides comprehensive platform information including platform type,
 * individual detection results, and environment details.
 */

import { PlatformType } from '../../constants/platform/PlatformType';
import { detectPlatformType } from './detectPlatformType';
import { isElectronPlatform } from './isElectronPlatform';
import { isCapacitorPlatform } from './isCapacitorPlatform';
import { isWebPlatform } from './isWebPlatform';
import { PlatformInfo } from './PlatformInfo';
import { hasWindow } from './hasWindow';
import { hasWindowProperty } from './hasWindowProperty';
import { platformCache } from './cache';

/**
 * Gets comprehensive platform information with caching
 *
 * Provides detailed information about the current platform including
 * the detected platform type, individual detection results, and
 * environment details. Results are cached for optimal performance
 * on subsequent calls.
 *
 * @returns PlatformInfo object with comprehensive platform details
 *
 * @example
 * ```typescript
 * const platformInfo = getPlatformInfo();
 * console.log(`Platform: ${platformInfo.platformType}`);
 * console.log(`Has Electron API: ${platformInfo.environment.hasElectronAPI}`);
 * ```
 */
export function getPlatformInfo(): PlatformInfo {
  try {
    // Check cache first for optimal performance
    const cachedInfo = platformCache.getCachedPlatformInfo();
    if (cachedInfo !== null) {
      return cachedInfo;
    }

    // Perform comprehensive detection if not cached
    const platformInfo = getPlatformInfoUncached();

    // Cache the result for future calls
    platformCache.setCachedResults(platformInfo.platformType, platformInfo);

    return platformInfo;
  } catch {
    // Safe fallback with minimal information
    return createFallbackPlatformInfo();
  }
}

/**
 * Performs uncached platform information detection
 *
 * Internal function that performs the actual comprehensive platform detection
 * logic without any caching. Used by the main getPlatformInfo function.
 *
 * @returns PlatformInfo object with comprehensive platform details
 */
function getPlatformInfoUncached(): PlatformInfo {
  try {
    const hasWindowObject = hasWindow();
    const hasElectronAPI = hasWindowProperty('electronAPI');
    const hasCapacitorAPI = hasWindowProperty('Capacitor');
    const hasNavigator = hasWindowProperty('navigator');

    return {
      platformType: detectPlatformType(),
      detections: {
        isElectron: isElectronPlatform(),
        isCapacitor: isCapacitorPlatform(),
        isWeb: isWebPlatform(),
      },
      environment: {
        hasWindow: hasWindowObject,
        hasElectronAPI,
        hasCapacitorAPI,
        hasNavigator,
      },
      timestamp: Date.now(),
    };
  } catch {
    return createFallbackPlatformInfo();
  }
}

/**
 * Creates fallback platform info for error conditions
 *
 * @returns Minimal PlatformInfo object with safe defaults
 */
function createFallbackPlatformInfo(): PlatformInfo {
  return {
    platformType: PlatformType.UNKNOWN,
    detections: {
      isElectron: false,
      isCapacitor: false,
      isWeb: false,
    },
    environment: {
      hasWindow: false,
      hasElectronAPI: false,
      hasCapacitorAPI: false,
      hasNavigator: false,
    },
    timestamp: Date.now(),
  };
}
