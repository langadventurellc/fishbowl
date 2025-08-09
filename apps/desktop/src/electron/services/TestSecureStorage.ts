import {
  createLoggerSync,
  type SecureStorageInterface,
} from "@fishbowl-ai/shared";
import { app } from "electron";
import * as fs from "fs";
import * as path from "path";

/**
 * Test-only secure storage implementation that uses plain text storage.
 * Used in CI/test environments where Electron safeStorage is not available.
 *
 * WARNING: This stores API keys in plain text and should NEVER be used in production!
 */
export class TestSecureStorage implements SecureStorageInterface {
  private readonly keyPrefix = "test_llm_api_key_";
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "TestSecureStorage" } },
  });
  private readonly storageFilePath: string;

  constructor() {
    // Store keys in userData directory (same as LlmSecureStorage for consistency)
    const userDataPath = app.getPath("userData");
    this.storageFilePath = path.join(userDataPath, "test_secure_keys.json");
    this.logger.debug("TestSecureStorage initialized", {
      storageFilePath: this.storageFilePath,
    });
    this.logger.warn(
      "Using TestSecureStorage - API keys stored in PLAIN TEXT!",
    );
  }

  /**
   * Always returns true for test environments.
   */
  isAvailable(): boolean {
    this.logger.debug("TestSecureStorage is always available");
    return true;
  }

  /**
   * Store an API key in plain text (test only!).
   */
  store(id: string, apiKey: string): void {
    if (!id || typeof id !== "string") {
      throw new Error("Invalid ID provided");
    }

    if (!apiKey || typeof apiKey !== "string") {
      throw new Error("Invalid API key provided");
    }

    const storageKey = this.getStorageKey(id);

    try {
      // Load existing storage
      const storage = this.loadStorage();

      // Store plain text key (NOT SECURE - test only!)
      storage[storageKey] = apiKey;

      // Save to file
      this.saveStorage(storage);

      this.logger.debug("API key stored (plain text)", { id });
    } catch (error) {
      this.logger.error("Failed to store API key", error as Error);
      throw new Error("Failed to store API key");
    }
  }

  /**
   * Retrieve an API key from plain text storage.
   */
  retrieve(id: string): string | null {
    if (!id || typeof id !== "string") {
      this.logger.warn("Invalid ID provided for retrieval", { id });
      return null;
    }

    const storageKey = this.getStorageKey(id);

    try {
      // Load storage from file
      const storage = this.loadStorage();

      // Return plain text key
      const apiKey = storage[storageKey] || null;

      this.logger.debug("API key retrieved", { id, found: !!apiKey });
      return apiKey;
    } catch (error) {
      this.logger.error("Failed to retrieve API key", error as Error);
      throw new Error("Failed to retrieve API key");
    }
  }

  /**
   * Delete an API key from storage.
   */
  delete(id: string): void {
    if (!id || typeof id !== "string") {
      this.logger.warn("Invalid ID provided for deletion", { id });
      return;
    }

    const storageKey = this.getStorageKey(id);

    try {
      // Load existing storage
      const storage = this.loadStorage();

      // Delete the key
      const existed = storageKey in storage;
      delete storage[storageKey];

      // Save updated storage
      this.saveStorage(storage);

      this.logger.debug("API key deleted", { id, existed });
    } catch (error) {
      this.logger.error("Failed to delete API key", error as Error);
      throw new Error("Failed to delete API key");
    }
  }

  /**
   * Load storage from file.
   */
  private loadStorage(): Record<string, string> {
    try {
      if (fs.existsSync(this.storageFilePath)) {
        const data = fs.readFileSync(this.storageFilePath, "utf8");
        return JSON.parse(data);
      }
    } catch (error) {
      this.logger.warn("Failed to load test storage file", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return {};
  }

  /**
   * Save storage to file.
   */
  private saveStorage(storage: Record<string, string>): void {
    try {
      const data = JSON.stringify(storage, null, 2);
      fs.writeFileSync(this.storageFilePath, data, "utf8");
    } catch (error) {
      this.logger.error("Failed to save test storage file", error as Error);
      throw new Error("Failed to persist keys");
    }
  }

  /**
   * Generate prefixed storage key.
   */
  private getStorageKey(id: string): string {
    return `${this.keyPrefix}${id}`;
  }
}
