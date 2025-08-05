/**
 * Base storage bridge interface for LLM provider configurations.
 *
 * Provides CRUD operations for managing provider instances
 * in platform-specific storage systems.
 *
 * @example
 * ```typescript
 * class DesktopStorage implements LlmStorageBridge {
 *   async get(key: string): Promise<LlmProviderInstance | null> {
 *     const data = await ipcRenderer.invoke('get-secure', key);
 *     return data ? JSON.parse(data) : null;
 *   }
 *   // ... other methods
 * }
 * ```
 */

import type { LlmProviderInstance } from "./LlmProviderInstance";

export interface LlmStorageBridge {
  /**
   * Retrieves a stored configuration by ID.
   *
   * @param key - Storage key (typically the configuration ID)
   * @returns The stored configuration or null if not found
   */
  get<T = LlmProviderInstance>(key: string): Promise<T | null>;

  /**
   * Stores a configuration.
   *
   * @param key - Storage key (typically the configuration ID)
   * @param value - The configuration to store
   */
  set<T = LlmProviderInstance>(key: string, value: T): Promise<void>;

  /**
   * Deletes a configuration.
   *
   * @param key - Storage key to delete
   */
  delete(key: string): Promise<void>;

  /**
   * Retrieves all configuration IDs.
   *
   * @returns Array of all stored configuration keys
   */
  getAllKeys(): Promise<string[]>;

  /**
   * Clears all configurations.
   *
   * WARNING: This removes all stored LLM configurations.
   */
  clear(): Promise<void>;
}
