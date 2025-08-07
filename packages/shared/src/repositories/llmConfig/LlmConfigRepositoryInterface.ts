import type {
  LlmConfig,
  LlmConfigInput,
  LlmConfigMetadata,
  StorageResult,
} from "../../types/llmConfig";

/**
 * Interface for LLM configuration repository operations.
 * Defines the contract for managing LLM configurations with secure API key storage.
 */
export interface LlmConfigRepositoryInterface {
  /**
   * Create a new LLM configuration with complete data validation.
   * Returns complete configuration including decrypted API key.
   */
  create(config: LlmConfigInput): Promise<LlmConfig>;

  /**
   * Read a complete LLM configuration by ID.
   * Returns configuration with decrypted API key or null if not found.
   */
  read(id: string): Promise<LlmConfig | null>;

  /**
   * Update an existing LLM configuration with partial updates.
   * Returns updated complete configuration.
   */
  update(id: string, updates: Partial<LlmConfigInput>): Promise<LlmConfig>;

  /**
   * Delete an LLM configuration completely from both storages.
   */
  delete(id: string): Promise<void>;

  /**
   * List all LLM configurations metadata (without API keys).
   */
  list(): Promise<LlmConfigMetadata[]>;

  /**
   * Check if a configuration exists by ID.
   */
  exists(id: string): Promise<boolean>;
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
