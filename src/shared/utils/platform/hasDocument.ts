/**
 * Safe Document Object Access
 *
 * Provides type-safe check for document object availability with
 * browser-specific validation for web environments.
 */

/**
 * Safely checks if document object exists with web browser features
 *
 * Validates that the document object is present and has the expected
 * browser DOM API surface, indicating a real web browser environment.
 *
 * @returns True if document object is available with web features
 */
export function hasDocument(): boolean {
  try {
    if (typeof globalThis === 'undefined') {
      return false;
    }

    const globalDocument = (globalThis as Record<string, unknown>).document;

    // Basic document existence check
    if (typeof globalDocument !== 'object' || globalDocument === null) {
      return false;
    }

    const doc = globalDocument as Record<string, unknown>;

    // Check for essential DOM API methods that indicate a real browser
    return (
      typeof doc.createElement === 'function' &&
      typeof doc.querySelector === 'function' &&
      typeof doc.addEventListener === 'function' &&
      'cookie' in doc &&
      'referrer' in doc
    );
  } catch {
    return false;
  }
}
