/**
 * Web Navigator Feature Detection
 *
 * Validates navigator object with web browser-specific features
 * that indicate a real browser environment (not a headless or hybrid context).
 */

/**
 * Safely checks if navigator has web browser features
 *
 * Validates that the navigator object is present and has browser-specific
 * properties and capabilities that indicate a genuine web browser environment.
 *
 * @returns True if navigator has web browser features
 */
export function hasWebNavigator(): boolean {
  try {
    if (typeof globalThis === 'undefined') {
      return false;
    }

    const globalNavigator = (globalThis as Record<string, unknown>).navigator;

    // Basic navigator existence check
    if (typeof globalNavigator !== 'object' || globalNavigator === null) {
      return false;
    }

    const nav = globalNavigator as Record<string, unknown>;

    // Check for essential browser navigator properties
    const hasBasicProperties =
      typeof nav.userAgent === 'string' &&
      typeof nav.platform === 'string' &&
      typeof nav.language === 'string';

    // Check for browser-specific capabilities (at least one should be present)
    const hasBrowserFeatures =
      'geolocation' in nav || 'serviceWorker' in nav || 'onLine' in nav || 'cookieEnabled' in nav;

    return hasBasicProperties && hasBrowserFeatures;
  } catch {
    return false;
  }
}
