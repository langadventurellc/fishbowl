/**
 * Web Platform Detection with Comprehensive Fallback Logic
 *
 * Detects if the current environment is running in a pure web browser
 * using multiple detection layers for robust identification with fallbacks.
 */

import { hasWindow } from './hasWindow';
import { hasDocument } from './hasDocument';
import { hasWebNavigator } from './hasWebNavigator';
import { hasWebAPIs } from './hasWebAPIs';
import { hasWebLocation } from './hasWebLocation';
import { isElectronPlatform } from './isElectronPlatform';
import { isCapacitorPlatform } from './isCapacitorPlatform';

/**
 * Detects if the current environment is running in a web browser
 *
 * Uses comprehensive multi-layer detection with fallback logic:
 * 1. Primary: Browser-specific feature detection (DOM, Navigator, APIs, Location)
 * 2. Secondary: Enhanced environment validation
 * 3. Tertiary: Process of elimination (not Electron, not Capacitor)
 * 4. Final: Safe fallback behavior
 *
 * @returns True if running in web browser environment
 *
 * @example
 * ```typescript
 * if (isWebPlatform()) {
 *   // Web-only code with confidence
 *   console.log('Running in web browser');
 * }
 * ```
 */
export function isWebPlatform(): boolean {
  try {
    // Primary Detection: Browser-specific feature validation
    // Check if we have a proper browser environment with web APIs
    const hasBrowserFeatures = hasWindow() && hasDocument() && hasWebNavigator() && hasWebAPIs();

    // If we have strong browser indicators, validate it's not a hybrid environment
    if (hasBrowserFeatures) {
      // Additional validation: check for web-specific location characteristics
      const hasWebEnvironment = hasWebLocation();

      // Exclude known hybrid platforms even if they have browser features
      const isNotHybrid = !isElectronPlatform() && !isCapacitorPlatform();

      // Primary detection: strong browser features + web environment + not hybrid
      if (hasWebEnvironment && isNotHybrid) {
        return true;
      }
    }

    // Secondary Detection: Process of elimination with basic validation
    // This is our current approach as a fallback
    const basicWebDetection = hasWindow() && !isElectronPlatform() && !isCapacitorPlatform();

    if (basicWebDetection) {
      // Tertiary validation: At least some web characteristics should be present
      return hasDocument() || hasWebNavigator();
    }

    // Final fallback: No web platform detected
    return false;
  } catch {
    // Safe fallback if any detection fails
    return false;
  }
}
