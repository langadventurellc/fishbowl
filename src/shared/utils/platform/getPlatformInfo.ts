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

/**
 * Gets comprehensive platform information
 *
 * Provides detailed information about the current platform including
 * the detected platform type, individual detection results, and
 * environment details. Useful for debugging and conditional logic.
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
    // Safe fallback with minimal information
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
}
