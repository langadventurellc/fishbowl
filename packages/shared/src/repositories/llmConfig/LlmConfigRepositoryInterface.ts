import type { LlmConfigMetadata, StorageResult } from "../../types/llmConfig";

/**
 * Interface for LLM configuration repository operations.
 * Defines the contract for managing LLM configurations with secure API key storage.
 */
export interface LlmConfigRepositoryInterface {
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
