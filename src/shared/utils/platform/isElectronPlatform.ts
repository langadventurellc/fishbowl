/**
 * Electron Platform Detection
 *
 * Wraps the existing `isElectronAPIAvailable()` function to provide
 * electron platform detection within the new platform detection system.
 * Maintains 100% backward compatibility with existing code.
 */

import { isElectronAPIAvailable } from '../../../renderer/hooks/useIpc/isElectronAPIAvailable';

/**
 * Detects if the current environment is running in Electron
 *
 * This function wraps the existing `isElectronAPIAvailable()` function
 * to maintain backward compatibility while integrating with the new
 * platform detection system.
 *
 * @returns True if running in Electron environment
 *
 * @example
 * ```typescript
 * if (isElectronPlatform()) {
 *   // Electron-specific code
 *   console.log('Running in Electron');
 * }
 * ```
 */
export function isElectronPlatform(): boolean {
  return isElectronAPIAvailable();
}
