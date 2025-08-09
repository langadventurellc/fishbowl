import type { LlmConfigMetadata, StorageResult } from "../../types/llmConfig";

/**
 * Low-level storage interface for LLM configuration persistence operations.
 * Works with metadata objects and StorageResult wrappers for detailed error handling.
 * Used for direct storage operations without domain logic.
 */
export interface LlmConfigStorageInterface {
  /**
   * Save a new LLM configuration with secure API key storage.
   */
  saveConfiguration(
    config: Omit<LlmConfigMetadata, "id" | "createdAt" | "updatedAt">,
    apiKey: string,
  ): Promise<StorageResult<string>>;

  /**
   * Update an existing LLM configuration.
   */
  updateConfiguration(
    id: string,
    updates: Partial<Omit<LlmConfigMetadata, "id" | "createdAt">>,
    newApiKey?: string,
  ): Promise<StorageResult<void>>;

  /**
   * Get a specific LLM configuration by ID.
   */
  getConfiguration(
    id: string,
  ): Promise<StorageResult<LlmConfigMetadata | null>>;

  /**
   * Get all LLM configurations.
   */
  getAllConfigurations(): Promise<StorageResult<LlmConfigMetadata[]>>;

  /**
   * Delete an LLM configuration completely.
   */
  deleteConfiguration(id: string): Promise<StorageResult<void>>;

  /**
   * Check if secure storage is available for API key encryption.
   */
  isSecureStorageAvailable(): boolean;
}
