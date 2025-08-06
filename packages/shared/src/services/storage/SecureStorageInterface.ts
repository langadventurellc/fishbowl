/**
 * Interface for secure storage operations.
 * Provides platform-agnostic API for encrypting and storing sensitive data.
 */
export interface SecureStorageInterface {
  /**
   * Check if secure storage is available on the system.
   * @returns true if encryption is available, false otherwise
   */
  isAvailable(): boolean;

  /**
   * Store an encrypted value with the given key.
   * @param key - Unique identifier for the stored value
   * @param value - Plain text value to encrypt and store
   * @throws Error if storage fails or is unavailable
   */
  store(key: string, value: string): void;

  /**
   * Retrieve and decrypt a value by key.
   * @param key - Unique identifier for the stored value
   * @returns Decrypted value or null if not found
   * @throws Error if decryption fails
   */
  retrieve(key: string): string | null;

  /**
   * Delete a stored value by key.
   * @param key - Unique identifier for the stored value
   */
  delete(key: string): void;
}
