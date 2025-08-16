import { randomBytes as nodeRandomBytes } from "crypto";
import { CryptoUtilsInterface } from "@fishbowl-ai/shared";

/**
 * Node.js-specific implementation of cryptographic utilities.
 * Uses Node.js crypto and buffer modules directly for optimal performance.
 */
export class NodeCryptoUtils implements CryptoUtilsInterface {
  /**
   * Generate cryptographically secure random bytes using Node.js crypto.
   * @param size - Number of bytes to generate
   * @returns Promise resolving to Uint8Array containing random bytes
   */
  async randomBytes(size: number): Promise<Uint8Array> {
    return new Uint8Array(nodeRandomBytes(size));
  }

  /**
   * Generate a unique identifier using Node.js crypto.
   * Creates a UUID v4 format identifier with cryptographically secure random values.
   * @returns A unique string identifier in UUID v4 format
   */
  generateId(): string {
    const bytes = nodeRandomBytes(16);

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
  }

  /**
   * Get the byte length of a string using Node.js Buffer.
   * @param str - String to measure
   * @returns Promise resolving to number of bytes in UTF-8 encoding
   */
  async getByteLength(str: string): Promise<number> {
    return Buffer.byteLength(str, "utf8");
  }
}
