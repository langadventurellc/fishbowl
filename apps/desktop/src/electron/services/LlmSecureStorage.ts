import {
  createLoggerSync,
  type SecureStorageInterface,
} from "@fishbowl-ai/shared";
import { safeStorage } from "electron";

/**
 * Secure storage service using Electron's safeStorage API.
 * Encrypts and stores LLM API keys with prefixed identifiers.
 */
export class LlmSecureStorage implements SecureStorageInterface {
  private readonly keyPrefix = "llm_api_key_";
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "LlmSecureStorage" } },
  });

  /**
   * Check if secure storage is available on the system.
   * @returns true if encryption is available, false otherwise
   */
  isAvailable(): boolean {
    try {
      const available = safeStorage.isEncryptionAvailable();
      this.logger.debug("Checking secure storage availability", { available });
      return available;
    } catch {
      this.logger.warn("Failed to check secure storage availability");
      return false;
    }
  }

  /**
   * Store an encrypted API key with the given ID.
   * @param id - Unique identifier for the API key
   * @param apiKey - Plain text API key to encrypt and store
   * @throws StorageError if encryption or storage fails
   */
  store(id: string, apiKey: string): void {
    // Validate inputs
    if (!id || typeof id !== "string") {
      throw new Error("Invalid ID provided");
    }

    if (!apiKey || typeof apiKey !== "string") {
      throw new Error("Invalid API key provided");
    }

    const storageKey = this.getStorageKey(id);

    try {
      if (!this.isAvailable()) {
        throw new Error("Secure storage is not available on this system");
      }

      // Encrypt the API key
      const encryptedBuffer = safeStorage.encryptString(apiKey);

      // Store in global object (persisted in Electron's main process)
      // Using global object pattern similar to how Electron apps store data
      if (!global.llmSecureStorage) {
        global.llmSecureStorage = new Map<string, string>();
      }

      // Convert buffer to base64 string for storage
      const encryptedString = encryptedBuffer.toString("base64");
      global.llmSecureStorage.set(storageKey, encryptedString);

      this.logger.debug("API key stored successfully", { id });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      this.logger.error("Failed to store API key", error as Error);
      throw new Error("Failed to encrypt and store API key");
    }
  }

  /**
   * Retrieve and decrypt an API key by ID.
   * @param id - Unique identifier for the API key
   * @returns Decrypted API key or null if not found
   * @throws StorageError if decryption fails
   */
  retrieve(id: string): string | null {
    // Validate input
    if (!id || typeof id !== "string") {
      this.logger.warn("Invalid ID provided for retrieval", { id });
      return null;
    }

    const storageKey = this.getStorageKey(id);

    try {
      if (!this.isAvailable()) {
        this.logger.warn("Secure storage not available for retrieval");
        return null;
      }

      // Check if storage exists
      if (
        !global.llmSecureStorage ||
        !global.llmSecureStorage.has(storageKey)
      ) {
        this.logger.debug("API key not found", { id });
        return null;
      }

      // Get encrypted string and convert back to buffer
      const encryptedString = global.llmSecureStorage.get(storageKey);
      if (!encryptedString) {
        return null;
      }

      const encryptedBuffer = Buffer.from(encryptedString, "base64");

      // Decrypt the API key
      const decryptedApiKey = safeStorage.decryptString(encryptedBuffer);

      this.logger.debug("API key retrieved successfully", { id });
      return decryptedApiKey;
    } catch (error) {
      this.logger.error("Failed to decrypt API key", error as Error);
      throw new Error("Failed to decrypt API key");
    }
  }

  /**
   * Delete an API key from secure storage.
   * @param id - Unique identifier for the API key
   * @throws StorageError if deletion fails
   */
  delete(id: string): void {
    // Validate input
    if (!id || typeof id !== "string") {
      this.logger.warn("Invalid ID provided for deletion", { id });
      return;
    }

    const storageKey = this.getStorageKey(id);

    try {
      // Check if storage exists
      if (!global.llmSecureStorage) {
        this.logger.debug("No secure storage to delete from", { id });
        return;
      }

      // Delete the key (no error if not found)
      const deleted = global.llmSecureStorage.delete(storageKey);

      this.logger.debug("API key deletion attempted", { id, deleted });
    } catch (error) {
      this.logger.error("Failed to delete API key", error as Error);
      throw new Error("Failed to delete API key");
    }
  }

  /**
   * Generate prefixed storage key.
   * @param id - Base identifier
   * @returns Prefixed storage key
   */
  private getStorageKey(id: string): string {
    return `${this.keyPrefix}${id}`;
  }
}

// Declare global type for TypeScript
declare global {
  var llmSecureStorage: Map<string, string> | undefined;
}
