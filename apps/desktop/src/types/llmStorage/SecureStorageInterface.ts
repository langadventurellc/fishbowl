/**
 * Interface for secure storage operations.
 * Defines the contract for encrypting and storing API keys.
 */
export interface SecureStorageInterface {
  /**
   * Check if secure storage is available on the system.
   * @returns true if encryption is available, false otherwise
   */
  isAvailable(): boolean;

  /**
   * Store an encrypted API key with the given ID.
   * @param id - Unique identifier for the API key
   * @param apiKey - Plain text API key to encrypt and store
   * @throws StorageError if encryption or storage fails
   */
  store(id: string, apiKey: string): void;

  /**
   * Retrieve and decrypt an API key by ID.
   * @param id - Unique identifier for the API key
   * @returns Decrypted API key or null if not found
   * @throws StorageError if decryption fails
   */
  retrieve(id: string): string | null;

  /**
   * Delete an API key from secure storage.
   * @param id - Unique identifier for the API key
   * @throws StorageError if deletion fails
   */
  delete(id: string): void;
}
