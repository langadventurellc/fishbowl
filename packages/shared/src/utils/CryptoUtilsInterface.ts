/**
 * Interface for cryptographic utilities.
 * Provides platform-agnostic crypto operations that can be implemented
 * differently for Node.js, browser, and React Native environments.
 */
export interface CryptoUtilsInterface {
  /**
   * Generate cryptographically secure random bytes.
   * @param size - Number of bytes to generate
   * @returns Promise resolving to Uint8Array containing random bytes
   */
  randomBytes(size: number): Promise<Uint8Array>;

  /**
   * Generate a unique identifier using cryptographically secure random values.
   * @returns A unique string identifier in UUID v4 format
   */
  generateId(): string;

  /**
   * Get the byte length of a string in UTF-8 encoding.
   * @param str - String to measure
   * @returns Promise resolving to number of bytes
   */
  getByteLength(str: string): Promise<number>;
}
