/**
 * Web Platform Detection
 *
 * Detects if the current environment is running in a pure web browser
 * (not Electron or Capacitor). This serves as a fallback detection method.
 */

import { hasWindow } from './hasWindow';
import { isElectronPlatform } from './isElectronPlatform';
import { isCapacitorPlatform } from './isCapacitorPlatform';

/**
 * Detects if the current environment is running in a web browser
 *
 * Determines web platform by process of elimination - if it's not
 * Electron and not Capacitor, then it's considered a web environment.
 * This provides a safe fallback for unknown environments.
 *
 * @returns True if running in web browser environment
 *
 * @example
 * ```typescript
 * if (isWebPlatform()) {
 *   // Web-only code
 *   console.log('Running in web browser');
 * }
 * ```
 */
export function isWebPlatform(): boolean {
  try {
    return hasWindow() && !isElectronPlatform() && !isCapacitorPlatform();
  } catch {
    // Safe fallback if detection fails
    return false;
  }
}
