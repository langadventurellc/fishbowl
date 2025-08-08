import type {
  LlmConfig,
  LlmConfigInput,
  LlmConfigMetadata,
  StorageResult,
} from "../../types/llmConfig";
import type { LlmConfigRepositoryInterface } from "./LlmConfigRepositoryInterface";
import { llmConfigInputSchema } from "../../types/llmConfig";
import { FileStorageService } from "../../services/storage/FileStorageService";
import type { SecureStorageInterface } from "../../services/storage/SecureStorageInterface";
import { FileStorageError } from "../../services/storage/errors";
import { createLoggerSync } from "../../logging/createLoggerSync";
import { generateId } from "../../utils/generateId";

/**
 * Repository for LLM configuration persistence operations.
 *
 * Coordinates between file storage for metadata and secure storage for API keys,
 * providing a unified interface for all LLM configuration operations.
 * Follows the repository pattern established by SettingsRepository.
 */
export class LlmConfigRepository implements LlmConfigRepositoryInterface {
  private static readonly DEFAULT_CONFIG_FILE_NAME = "llm_config.json";
  private readonly configFilePath: string;
  private readonly keyPrefix = "llm_api_key_";
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "LlmConfigRepository" } },
  });

  /**
   * Create LLM config repository with storage dependencies.
   *
   * @param fileStorageService File storage service for JSON operations
   * @param secureStorage Secure storage service for API key encryption
   * @param configFilePath Optional custom path for config file (defaults to "llm_config.json")
   */
  constructor(
    private fileStorageService: FileStorageService<LlmConfigMetadata[]>,
    private secureStorage: SecureStorageInterface,
    configFilePath?: string,
  ) {
    this.configFilePath =
      configFilePath ?? LlmConfigRepository.DEFAULT_CONFIG_FILE_NAME;
  }

  /**
   * Create a new LLM configuration with complete data validation.
   * Returns complete configuration including decrypted API key.
   */
  async create(
    config: LlmConfigInput,
    providedId?: string,
  ): Promise<LlmConfig> {
    // Validate input
    const validatedInput = llmConfigInputSchema.parse(config);

    // Use provided ID or generate new one
    const id = providedId || generateId();
    const now = new Date().toISOString();

    // Check secure storage availability
    if (!this.secureStorage.isAvailable()) {
      throw new Error("Secure storage is not available on this system");
    }

    // Store API key securely
    const secureKey = this.getSecureStorageKey(id);
    this.secureStorage.store(secureKey, validatedInput.apiKey);

    try {
      // Create metadata (without API key)
      const metadata: LlmConfigMetadata = {
        id,
        customName: validatedInput.customName,
        provider: validatedInput.provider,
        baseUrl: validatedInput.baseUrl,
        useAuthHeader: validatedInput.useAuthHeader,
        createdAt: now,
        updatedAt: now,
      };

      // Load existing configs and add new one
      const configs = await this.loadConfigurationsInternal();
      configs.push(metadata);

      // Save to file
      await this.fileStorageService.writeJsonFile(this.configFilePath, configs);

      this.logger.debug("LLM configuration created successfully", {
        configId: id,
        provider: validatedInput.provider,
      });

      // Return complete config
      return {
        ...metadata,
        apiKey: validatedInput.apiKey,
      };
    } catch (error) {
      this.logger.error("Error during create operation", error as Error);

      // Rollback: delete API key from secure storage
      try {
        this.secureStorage.delete(secureKey);
      } catch {
        // Ignore cleanup errors
      }
      throw error;
    }
  }

  /**
   * Read a complete LLM configuration by ID.
   * Returns configuration with decrypted API key or null if not found.
   */
  async read(id: string): Promise<LlmConfig | null> {
    // Load metadata
    const configs = await this.loadConfigurationsInternal();
    const metadata = configs.find((c) => c.id === id);

    if (!metadata) {
      return null;
    }

    // Check secure storage availability
    if (!this.secureStorage.isAvailable()) {
      this.logger.warn("Secure storage unavailable, cannot retrieve API key", {
        configId: id,
      });
      return null;
    }

    // Retrieve and decrypt API key
    const secureKey = this.getSecureStorageKey(id);
    const apiKey = this.secureStorage.retrieve(secureKey);

    if (!apiKey) {
      this.logger.warn("Configuration found but API key missing", {
        configId: id,
      });
      return null;
    }

    // Return complete config
    return {
      ...metadata,
      apiKey,
    };
  }

  /**
   * Update an existing LLM configuration with partial updates.
   * Returns updated complete configuration.
   */
  async update(
    id: string,
    updates: Partial<LlmConfigInput>,
  ): Promise<LlmConfig> {
    // Validate updates if provided
    if (Object.keys(updates).length > 0) {
      llmConfigInputSchema.partial().parse(updates);
    }

    // Load existing config
    const configs = await this.loadConfigurationsInternal();
    const configIndex = configs.findIndex((c) => c.id === id);

    if (configIndex === -1) {
      throw new Error(`Configuration not found: ${id}`);
    }

    const existingMetadata = configs[configIndex]!; // Safe because we checked configIndex !== -1

    // Update API key if provided
    let currentApiKey: string | null = null;
    if (updates.apiKey) {
      if (!this.secureStorage.isAvailable()) {
        throw new Error("Secure storage is not available for API key update");
      }

      const secureKey = this.getSecureStorageKey(id);
      this.secureStorage.store(secureKey, updates.apiKey);
      currentApiKey = updates.apiKey;
    } else {
      // Retrieve existing API key
      const secureKey = this.getSecureStorageKey(id);
      currentApiKey = this.secureStorage.retrieve(secureKey);
      if (!currentApiKey) {
        throw new Error(`API key not found for configuration: ${id}`);
      }
    }

    // Update metadata
    const updatedMetadata: LlmConfigMetadata = {
      id: existingMetadata.id,
      createdAt: existingMetadata.createdAt,
      customName: updates.customName ?? existingMetadata.customName,
      provider: updates.provider ?? existingMetadata.provider,
      baseUrl:
        updates.baseUrl !== undefined
          ? updates.baseUrl
          : existingMetadata.baseUrl,
      useAuthHeader:
        updates.useAuthHeader !== undefined
          ? updates.useAuthHeader
          : existingMetadata.useAuthHeader,
      updatedAt: new Date().toISOString(),
    };

    configs[configIndex] = updatedMetadata;

    // Save updated configs
    await this.fileStorageService.writeJsonFile(this.configFilePath, configs);

    this.logger.debug("LLM configuration updated successfully", {
      configId: id,
      hasNewApiKey: !!updates.apiKey,
    });

    // Return complete updated config
    return {
      ...updatedMetadata,
      apiKey: currentApiKey,
    };
  }

  /**
   * Delete an LLM configuration completely from both storages.
   */
  async delete(id: string): Promise<void> {
    const result = await this.deleteConfiguration(id);
    if (!result.success) {
      throw new Error(result.error || `Failed to delete configuration: ${id}`);
    }
  }

  /**
   * List all LLM configurations metadata (without API keys).
   */
  async list(): Promise<LlmConfigMetadata[]> {
    const result = await this.getAllConfigurations();
    if (!result.success) {
      throw new Error(result.error || "Failed to list configurations");
    }
    return result.data || [];
  }

  /**
   * Check if a configuration exists by ID.
   */
  async exists(id: string): Promise<boolean> {
    const configs = await this.loadConfigurationsInternal();
    return configs.some((c) => c.id === id);
  }

  /**
   * Save a new LLM configuration with secure API key storage.
   * Generates unique ID and timestamps automatically.
   *
   * @param config Configuration metadata (without id/timestamps)
   * @param apiKey API key to encrypt and store securely
   * @returns Promise resolving to configuration ID or error
   */
  async saveConfiguration(
    config: Omit<LlmConfigMetadata, "id" | "createdAt" | "updatedAt">,
    apiKey: string,
  ): Promise<StorageResult<string>> {
    try {
      // Generate unique ID
      const id = generateId();
      const now = new Date().toISOString();

      // Create complete configuration metadata
      const configMetadata: LlmConfigMetadata = {
        ...config,
        id,
        createdAt: now,
        updatedAt: now,
      };

      // Store API key securely first
      if (!this.secureStorage.isAvailable()) {
        return {
          success: false,
          error: "Secure storage is not available on this system",
        };
      }

      const secureKey = this.getSecureStorageKey(id);
      this.secureStorage.store(secureKey, apiKey);

      try {
        // Load existing configurations
        const configs = await this.loadConfigurationsInternal();

        // Add new configuration
        configs.push(configMetadata);

        // Save updated list
        await this.fileStorageService.writeJsonFile(
          this.configFilePath,
          configs,
        );

        this.logger.debug("LLM configuration saved successfully", {
          configId: id,
          provider: config.provider,
        });

        return { success: true, data: id };
      } catch (fileError) {
        // Cleanup secure storage on file save failure
        try {
          this.secureStorage.delete(secureKey);
        } catch {
          // Ignore cleanup errors
        }
        throw fileError;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Failed to save LLM configuration", error as Error);
      return { success: false, error: message };
    }
  }

  /**
   * Update an existing LLM configuration.
   * Can update metadata, API key, or both.
   *
   * @param id Configuration ID to update
   * @param updates Partial metadata updates
   * @param newApiKey Optional new API key to store
   * @returns Promise resolving to success/error result
   */
  async updateConfiguration(
    id: string,
    updates: Partial<Omit<LlmConfigMetadata, "id" | "createdAt">>,
    newApiKey?: string,
  ): Promise<StorageResult<void>> {
    try {
      // Load existing configurations
      const configs = await this.loadConfigurationsInternal();
      const configIndex = configs.findIndex((c) => c.id === id);

      if (configIndex === -1) {
        return { success: false, error: "Configuration not found" };
      }

      // Update API key if provided
      if (newApiKey) {
        if (!this.secureStorage.isAvailable()) {
          return {
            success: false,
            error: "Secure storage is not available for API key update",
          };
        }

        const secureKey = this.getSecureStorageKey(id);
        this.secureStorage.store(secureKey, newApiKey);
      }

      // Update metadata
      const existingConfig = configs[configIndex];
      if (!existingConfig) {
        return { success: false, error: "Configuration not found" };
      }

      const updatedConfig: LlmConfigMetadata = {
        customName: updates.customName ?? existingConfig.customName,
        provider: updates.provider ?? existingConfig.provider,
        baseUrl: updates.baseUrl ?? existingConfig.baseUrl,
        useAuthHeader: updates.useAuthHeader ?? existingConfig.useAuthHeader,
        id, // Ensure ID cannot be changed
        createdAt: existingConfig.createdAt, // Preserve original creation time
        updatedAt: new Date().toISOString(),
      };

      configs[configIndex] = updatedConfig;

      // Save updated configurations
      await this.fileStorageService.writeJsonFile(this.configFilePath, configs);

      this.logger.debug("LLM configuration updated successfully", {
        configId: id,
        hasNewApiKey: !!newApiKey,
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Failed to update LLM configuration", error as Error);
      return { success: false, error: message };
    }
  }

  /**
   * Get a specific LLM configuration by ID.
   * Verifies that corresponding API key exists in secure storage.
   *
   * @param id Configuration ID to retrieve
   * @returns Promise resolving to configuration or error
   */
  async getConfiguration(
    id: string,
  ): Promise<StorageResult<LlmConfigMetadata | null>> {
    try {
      const configs = await this.loadConfigurationsInternal();
      const config = configs.find((c) => c.id === id);

      if (!config) {
        return { success: true, data: null };
      }

      // Verify API key exists in secure storage
      if (this.secureStorage.isAvailable()) {
        const secureKey = this.getSecureStorageKey(id);
        const hasApiKey = this.secureStorage.retrieve(secureKey) !== null;

        if (!hasApiKey) {
          this.logger.warn("Configuration found but API key missing", {
            configId: id,
          });
        }
      }

      return { success: true, data: config };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Failed to get LLM configuration", error as Error);
      return { success: false, error: message };
    }
  }

  /**
   * Get all LLM configurations.
   * Returns configurations that have valid metadata files.
   *
   * @returns Promise resolving to all configurations or error
   */
  async getAllConfigurations(): Promise<StorageResult<LlmConfigMetadata[]>> {
    try {
      const configs = await this.loadConfigurationsInternal();

      this.logger.debug("Loaded LLM configurations", { count: configs.length });
      return { success: true, data: configs };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Failed to load LLM configurations", error as Error);
      return { success: false, error: message };
    }
  }

  /**
   * Delete an LLM configuration completely.
   * Removes both metadata and API key from their respective storages.
   *
   * @param id Configuration ID to delete
   * @returns Promise resolving to success/error result
   */
  async deleteConfiguration(id: string): Promise<StorageResult<void>> {
    try {
      // Load existing configurations
      const configs = await this.loadConfigurationsInternal();
      const initialCount = configs.length;
      const filteredConfigs = configs.filter((c) => c.id !== id);

      if (filteredConfigs.length === initialCount) {
        return { success: false, error: "Configuration not found" };
      }

      // Remove from file storage first
      await this.fileStorageService.writeJsonFile(
        this.configFilePath,
        filteredConfigs,
      );

      // Remove from secure storage
      if (this.secureStorage.isAvailable()) {
        const secureKey = this.getSecureStorageKey(id);
        this.secureStorage.delete(secureKey);
      }

      this.logger.debug("LLM configuration deleted successfully", {
        configId: id,
      });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Failed to delete LLM configuration", error as Error);
      return { success: false, error: message };
    }
  }

  /**
   * Check if secure storage is available for API key encryption.
   *
   * @returns true if secure storage is available, false otherwise
   */
  isSecureStorageAvailable(): boolean {
    return this.secureStorage.isAvailable();
  }

  /**
   * Internal method to load configurations from file storage.
   * Returns empty array if file doesn't exist.
   */
  private async loadConfigurationsInternal(): Promise<LlmConfigMetadata[]> {
    try {
      this.logger.debug("Loading configurations from file", {
        configFilePath: this.configFilePath,
      });
      const result = await this.fileStorageService.readJsonFile<
        LlmConfigMetadata[]
      >(this.configFilePath);
      this.logger.debug("Successfully loaded configurations from file", {
        count: result.length,
        configs: result.map((c) => ({ id: c.id, customName: c.customName })),
      });
      return result;
    } catch (error) {
      // Return empty array if file doesn't exist
      if (error instanceof FileStorageError && error.operation === "read") {
        this.logger.debug(
          "LLM config file does not exist, returning empty array",
          { configFilePath: this.configFilePath },
        );
        return [];
      }
      this.logger.error(
        "Failed to load configurations from file",
        error as Error,
        {
          configFilePath: this.configFilePath,
        },
      );
      throw error;
    }
  }

  /**
   * Generate prefixed storage key for secure storage.
   */
  private getSecureStorageKey(id: string): string {
    return `${this.keyPrefix}${id}`;
  }
}
