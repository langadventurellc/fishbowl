/**
 * Web Browser API Detection
 *
 * Checks for the presence of web-specific APIs that are typically
 * available in browsers but not in hybrid or native environments.
 */

/**
 * Safely checks for web browser-specific APIs
 *
 * Validates the presence of APIs that are standard in web browsers
 * but typically not available or modified in Electron, Capacitor,
 * or other hybrid environments.
 *
 * @returns True if web-specific APIs are available
 */
export function hasWebAPIs(): boolean {
  try {
    if (typeof globalThis === 'undefined') {
      return false;
    }

    // Check for core web APIs (at least 3 should be present for confidence)
    const webAPIs = [
      'fetch' in globalThis && typeof globalThis.fetch === 'function',
      'localStorage' in globalThis,
      'sessionStorage' in globalThis,
      'history' in globalThis &&
        (globalThis as Record<string, unknown>).history !== null &&
        typeof (globalThis as Record<string, unknown>).history === 'object' &&
        'pushState' in ((globalThis as Record<string, unknown>).history as Record<string, unknown>),
      'requestAnimationFrame' in globalThis,
      'URL' in globalThis && typeof globalThis.URL === 'function',
      'FormData' in globalThis && typeof globalThis.FormData === 'function',
    ];

    // Count available APIs
    const availableAPIs = webAPIs.filter(Boolean).length;

    // Require at least 3 web APIs to be confident it's a real browser
    return availableAPIs >= 3;
  } catch {
    return false;
  }
}
