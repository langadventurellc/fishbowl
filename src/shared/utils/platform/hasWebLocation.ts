/**
 * Web Location Detection
 *
 * Validates location object with web browser-specific properties
 * and protocols that indicate a browser environment.
 */

/**
 * Safely checks if location indicates web browser environment
 *
 * Validates that the location object has web browser characteristics
 * including appropriate protocols and expected browser location features.
 *
 * @returns True if location indicates web browser
 */
export function hasWebLocation(): boolean {
  try {
    if (typeof globalThis === 'undefined') {
      return false;
    }

    const globalLocation = (globalThis as Record<string, unknown>).location;

    // Basic location existence check
    if (typeof globalLocation !== 'object' || globalLocation === null) {
      return false;
    }

    const loc = globalLocation as Record<string, unknown>;

    // Check for essential location properties
    const hasLocationProperties =
      typeof loc.href === 'string' &&
      typeof loc.protocol === 'string' &&
      typeof loc.hostname === 'string' &&
      typeof loc.reload === 'function';

    if (!hasLocationProperties) {
      return false;
    }

    // Check for web protocols (not file:// or custom protocols used by Electron/Capacitor)
    const protocol = loc.protocol as string;
    const isWebProtocol = protocol === 'http:' || protocol === 'https:';

    // Explicitly reject non-web protocols
    if (protocol === 'file:' || protocol.startsWith('capacitor') || protocol.startsWith('app')) {
      return false;
    }

    // Check that hostname is not localhost (which could indicate dev Electron)
    const hostname = loc.hostname as string;
    const hasRealHostname = hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname !== '';

    // For web browsers, we expect either web protocol OR real hostname
    // (dev environments might use localhost but still be web browsers)
    return isWebProtocol || hasRealHostname;
  } catch {
    return false;
  }
}
