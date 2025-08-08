/**
 * Generates a unique identifier for configurations and entities.
 *
 * Uses platform-appropriate crypto APIs to generate a UUID-like identifier.
 * Works in both Node.js and browser environments.
 *
 * @returns A unique string identifier
 *
 * @example
 * const id = generateId();
 * // Returns: "550e8400-e29b-41d4-a716-446655440000"
 */
export function generateId(): string {
  try {
    let bytes: Uint8Array;

    // Check if we're in Node.js environment
    if (typeof process !== "undefined" && process.versions?.node) {
      // Node.js environment - use crypto module
      const crypto = eval('require("crypto")');
      bytes = crypto.randomBytes(16);
    } else if (
      typeof globalThis.crypto !== "undefined" &&
      globalThis.crypto.getRandomValues
    ) {
      // Browser environment - use Web Crypto API
      bytes = new Uint8Array(16);
      globalThis.crypto.getRandomValues(bytes);
    } else {
      // Fallback if neither is available
      throw new Error("No crypto API available");
    }

    // Convert to UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const uuid = [
      hex.substring(0, 8),
      hex.substring(8, 12),
      "4" + hex.substring(13, 16), // Version 4 UUID
      ((parseInt(hex.substring(16, 17), 16) & 0x3) | 0x8).toString(16) +
        hex.substring(17, 20),
      hex.substring(20, 32),
    ].join("-");

    return uuid;
  } catch {
    // Fallback: timestamp in base36 + random string
    // This provides reasonable uniqueness for configuration purposes
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
