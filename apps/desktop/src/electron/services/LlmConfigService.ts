import { randomUUID } from "crypto";
import {
  createLoggerSync,
  type LlmConfig,
  type LlmConfigInput,
} from "@fishbowl-ai/shared";
import { LlmStorageService } from "./LlmStorageService";
import type { LlmConfigServiceInterface } from "./LlmConfigServiceInterface";
import {
  DuplicateConfigError,
  ConfigNotFoundError,
  InvalidConfigError,
  ConfigOperationError,
} from "./errors";

/**
 * Service class that provides all business logic for managing LLM provider configurations.
 * Acts as the orchestration layer between the UI and the storage layer, handling
 * CRUD operations, business rule enforcement, and error handling.
 *
 * This service uses dependency injection for the storage service and implements
 * a clean interface for all CRUD operations with comprehensive error handling.
 */
export class LlmConfigService implements LlmConfigServiceInterface {
  private storageService: LlmStorageService;
  private logger = createLoggerSync({
    context: { metadata: { component: "LlmConfigService" } },
  });
  private cache: Map<string, LlmConfig> = new Map();
  private initialized: boolean = false;

  constructor(storageService?: LlmStorageService) {
    this.storageService = storageService ?? LlmStorageService.getInstance();
  }

  /**
   * Initialize the service by loading existing configurations and validating the service state.
   * Should be called during application startup.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load all configurations from storage using the new private method
      const configs = await this.getAllConfigurationsFromStorage();

      // Populate cache
      configs.forEach((config) => {
        this.cache.set(config.id, config);
      });

      this.initialized = true;
      this.logger.info("LlmConfigService initialized successfully", {
        configCount: configs.length,
      });
    } catch (error) {
      this.logger.error(
        "Failed to initialize LlmConfigService",
        error as Error,
      );
      // Continue with empty cache for graceful degradation
      this.initialized = true;
    }
  }

  /**
   * Ensure service is initialized before operations.
   * Implements lazy initialization pattern.
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Create a new LLM configuration with validation and business rule enforcement.
   * Generates unique ID, checks for duplicate names, and saves to storage.
   */
  async create(input: LlmConfigInput): Promise<LlmConfig> {
    try {
      await this.ensureInitialized();

      // Generate unique ID using crypto.randomUUID()
      const id = randomUUID();

      // Check cache for duplicate names (more efficient than storage call)
      const configs = Array.from(this.cache.values());
      const duplicateName = configs.find(
        (cfg) => cfg.customName === input.customName,
      );

      if (duplicateName) {
        throw new DuplicateConfigError(input.customName);
      }

      // Save using storage service repository
      const result = await this.storageService.repository.create(input);

      // Override the repository-generated ID with our UUID and ensure proper timestamps
      const now = new Date().toISOString();
      const finalConfig: LlmConfig = {
        ...result,
        id,
        createdAt: now,
        updatedAt: now,
      };

      // Update cache with new configuration
      this.cache.set(finalConfig.id, finalConfig);

      this.logger.info("LLM configuration created successfully", {
        id,
        provider: input.provider,
        customName: input.customName,
      });

      return finalConfig;
    } catch (error) {
      if (error instanceof DuplicateConfigError) {
        throw error;
      }

      this.logger.error("Failed to create LLM configuration", error as Error);
      throw new ConfigOperationError(
        "create",
        "Configuration creation failed",
        { provider: input.provider },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Retrieve a single configuration by ID.
   * Returns null if not found rather than throwing an error.
   */
  async read(id: string): Promise<LlmConfig | null> {
    try {
      await this.ensureInitialized();

      this.logger.debug("Reading LLM configuration from cache", { id });

      // Validate ID format (keep existing validation)
      if (!id || typeof id !== "string") {
        throw new InvalidConfigError("Invalid configuration ID", {
          providedId: id,
        });
      }

      // Get from cache instead of storage
      const config = this.cache.get(id) || null;

      this.logger.debug(
        config ? "Configuration found in cache" : "Configuration not found",
        { id },
      );
      return config;
    } catch (error) {
      if (
        error instanceof InvalidConfigError ||
        error instanceof ConfigOperationError
      ) {
        throw error;
      }

      this.logger.error("Failed to read LLM configuration", error as Error);
      throw new ConfigOperationError(
        "read",
        "Configuration read failed",
        { id },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Update an existing configuration with validation and business rule enforcement.
   * Checks for existence, validates duplicate names, and updates timestamps.
   */
  async update(
    id: string,
    updates: Partial<LlmConfigInput>,
  ): Promise<LlmConfig> {
    try {
      await this.ensureInitialized();

      // Get existing from cache
      const existing = this.cache.get(id);
      if (!existing) {
        throw new ConfigNotFoundError(id);
      }

      // Check for duplicate names in cache if name is changing
      if (updates.customName && updates.customName !== existing.customName) {
        const configs = Array.from(this.cache.values());
        const duplicate = configs.find(
          (cfg) => cfg.customName === updates.customName && cfg.id !== id,
        );

        if (duplicate) {
          throw new DuplicateConfigError(updates.customName);
        }
      }

      // Update storage first
      const result = await this.storageService.repository.update(id, updates);

      // Update cache only if storage succeeds
      const updatedConfig: LlmConfig = {
        ...result,
        updatedAt: new Date().toISOString(),
      };

      this.cache.set(id, updatedConfig);

      this.logger.info("LLM configuration updated successfully", {
        id,
        updatedFields: Object.keys(updates),
      });

      return updatedConfig;
    } catch (error) {
      if (
        error instanceof ConfigNotFoundError ||
        error instanceof DuplicateConfigError
      ) {
        throw error;
      }

      this.logger.error("Failed to update LLM configuration", error as Error);
      throw new ConfigOperationError(
        "update",
        "Configuration update failed",
        { id, updates },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Delete a configuration by ID.
   * Handles non-existent configurations gracefully without throwing errors.
   */
  async delete(id: string): Promise<void> {
    try {
      await this.ensureInitialized();

      // Check cache instead of storage
      const existing = this.cache.get(id);
      if (!existing) {
        this.logger.debug("Configuration not found in cache for deletion", {
          id,
        });
        return;
      }

      // Delete from storage first
      const result = await this.storageService.deleteConfiguration(id);

      if (!result.success) {
        throw new ConfigOperationError(
          "delete",
          result.error || "Failed to delete configuration",
          { id },
        );
      }

      // Remove from cache only if storage deletion succeeds
      this.cache.delete(id);

      this.logger.info("LLM configuration deleted successfully", {
        id,
        provider: existing.provider,
        customName: existing.customName,
      });
    } catch (error) {
      if (error instanceof ConfigOperationError) {
        throw error;
      }

      this.logger.error("Failed to delete LLM configuration", error as Error);
      throw new ConfigOperationError(
        "delete",
        "Configuration deletion failed",
        { id },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Retrieve all configurations from storage.
   * Returns empty array if no configurations exist.
   */
  async list(): Promise<LlmConfig[]> {
    try {
      await this.ensureInitialized();

      const configs = Array.from(this.cache.values());

      this.logger.debug("Listed LLM configurations from cache", {
        count: configs.length,
      });

      return configs;
    } catch (error) {
      if (error instanceof ConfigOperationError) {
        throw error;
      }

      this.logger.error("Failed to list LLM configurations", error as Error);
      throw new ConfigOperationError(
        "list",
        "Configuration list failed",
        undefined,
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Load all configurations directly from storage.
   * Private method used only for cache initialization.
   */
  private async getAllConfigurationsFromStorage(): Promise<LlmConfig[]> {
    const result = await this.storageService.getAllConfigurations();

    if (!result.success) {
      throw new ConfigOperationError(
        "list",
        result.error || "Failed to load configurations from storage",
      );
    }

    // Get complete configs with API keys
    const completeConfigs: LlmConfig[] = [];
    for (const metadata of result.data || []) {
      const completeResult = await this.storageService.getCompleteConfiguration(
        metadata.id,
      );
      if (completeResult.success && completeResult.data) {
        completeConfigs.push(completeResult.data);
      }
    }

    return completeConfigs;
  }
}

// Export singleton instance
export const llmConfigService = new LlmConfigService();
