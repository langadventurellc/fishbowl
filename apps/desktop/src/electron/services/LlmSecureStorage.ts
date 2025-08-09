import {
  createLoggerSync,
  type SecureStorageInterface,
} from "@fishbowl-ai/shared";
import { safeStorage, app } from "electron";
import * as fs from "fs";
import * as path from "path";

/**
 * Secure storage service using Electron's safeStorage API.
 * Encrypts and stores LLM API keys with prefixed identifiers in a persistent file.
 */
export class LlmSecureStorage implements SecureStorageInterface {
  private readonly keyPrefix = "llm_api_key_";
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "LlmSecureStorage" } },
  });
  private readonly storageFilePath: string;

  constructor() {
    // Store encrypted keys in userData directory
    const userDataPath = app.getPath("userData");
    this.storageFilePath = path.join(userDataPath, "secure_keys.json");
    this.logger.debug("LlmSecureStorage initialized", {
      storageFilePath: this.storageFilePath,
    });
  }

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
   * Load encrypted keys from persistent storage file.
   */
  private loadStorage(): Record<string, string> {
    try {
      if (fs.existsSync(this.storageFilePath)) {
        const data = fs.readFileSync(this.storageFilePath, "utf8");
        return JSON.parse(data);
      }
    } catch (error) {
      this.logger.warn("Failed to load secure storage file", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return {};
  }

  /**
   * Save encrypted keys to persistent storage file.
   */
  private saveStorage(storage: Record<string, string>): void {
    try {
      const data = JSON.stringify(storage, null, 2);
      fs.writeFileSync(this.storageFilePath, data, "utf8");
    } catch (error) {
      this.logger.error("Failed to save secure storage file", error as Error);
      throw new Error("Failed to persist encrypted keys");
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

      // Load existing storage
      const storage = this.loadStorage();

      // Convert buffer to base64 string for storage
      const encryptedString = encryptedBuffer.toString("base64");
      storage[storageKey] = encryptedString;

      // Save to persistent file
      this.saveStorage(storage);

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

      // Load storage from file
      const storage = this.loadStorage();

      // Check if key exists
      if (!storage[storageKey]) {
        this.logger.debug("API key not found in storage", { id });
        return null;
      }

      // Get encrypted string and convert back to buffer
      const encryptedString = storage[storageKey];
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
      // Load existing storage
      const storage = this.loadStorage();

      // Delete the key (no error if not found)
      const existed = storageKey in storage;
      delete storage[storageKey];

      // Save updated storage
      this.saveStorage(storage);

      this.logger.debug("API key deletion attempted", { id, existed });
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
