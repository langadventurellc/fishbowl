import { CryptoUtilsInterface } from "@fishbowl-ai/shared";

/**
 * Browser-specific crypto utilities implementation for Electron renderer process.
 * Uses Web Crypto API and TextEncoder for pure browser-based cryptographic operations.
 *
 * This implementation assumes a modern browser environment with Web Crypto API support.
 * No fallbacks or platform detection are included - pure Web API implementations only.
 */
export class BrowserCryptoUtils implements CryptoUtilsInterface {
  /**
   * Generate cryptographically secure random bytes using Web Crypto API.
   * @param size - Number of bytes to generate
   * @returns Promise resolving to Uint8Array containing random bytes
   * @throws Error if Web Crypto API is not available
   */
  async randomBytes(size: number): Promise<Uint8Array> {
    if (!globalThis.crypto?.getRandomValues) {
      throw new Error(
        "Web Crypto API is not available - crypto.getRandomValues not found",
      );
    }

    if (size < 0 || !Number.isInteger(size)) {
      throw new Error("Size must be a non-negative integer");
    }

    const bytes = new Uint8Array(size);
    globalThis.crypto.getRandomValues(bytes);
    return bytes;
  }

  /**
   * Generate a unique identifier using Web Crypto API.
   * Creates a proper UUID v4 format string using cryptographically secure random values.
   * @returns A unique string identifier in UUID v4 format
   * @throws Error if Web Crypto API is not available
   */
  generateId(): string {
    if (!globalThis.crypto?.getRandomValues) {
      throw new Error(
        "Web Crypto API is not available - crypto.getRandomValues not found",
      );
    }

    // Generate 16 random bytes for UUID
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);

    // Convert to hex string
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Format as UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuid = [
      hex.substring(0, 8),
      hex.substring(8, 12),
      "4" + hex.substring(13, 16), // Version 4 UUID
      ((parseInt(hex.substring(16, 17), 16) & 0x3) | 0x8).toString(16) +
        hex.substring(17, 20), // Variant bits
      hex.substring(20, 32),
    ].join("-");

    return uuid;
  }

  /**
   * Get the byte length of a string using TextEncoder.
   * Calculates accurate UTF-8 byte length for the given string.
   * @param str - String to measure
   * @returns Promise resolving to number of bytes in UTF-8 encoding
   * @throws Error if TextEncoder is not available
   */
  async getByteLength(str: string): Promise<number> {
    if (!globalThis.TextEncoder) {
      throw new Error("TextEncoder is not available");
    }

    const encoder = new TextEncoder();
    return encoder.encode(str).length;
  }
}
