import type {
  LlmConfig,
  LlmConfigInput,
  LlmConfigMetadata,
} from "../../types/llmConfig";

/**
 * High-level repository interface for LLM configuration domain operations.
 * Works with complete LlmConfig objects including decrypted API keys.
 * Throws errors on failure for simpler error handling in domain logic.
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
}
