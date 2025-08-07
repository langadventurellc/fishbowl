import { app } from "electron";
import * as path from "path";
import {
  LlmConfigRepository,
  FileStorageService,
  NodeFileSystemBridge,
  type LlmConfig,
  type LlmConfigInput,
  type LlmConfigMetadata,
  type StorageResult,
  createLoggerSync,
} from "@fishbowl-ai/shared";
import { ZodError } from "zod";
import { LlmSecureStorage } from "./LlmSecureStorage";

/**
 * Unified LLM storage service for the Fishbowl desktop application.
 *
 * Coordinates between secure API key storage and configuration metadata storage
 * using the shared LlmConfigRepository and Electron-specific secure storage.
 * Provides a single interface for all LLM configuration operations.
 */
export class LlmStorageService {
  private static instance: LlmStorageService | null = null;

  public repository: LlmConfigRepository;
  private logger = createLoggerSync({
    context: { metadata: { component: "LlmStorageService" } },
  });

  /**
   * Get singleton instance of LlmStorageService
   */
  public static getInstance(): LlmStorageService {
    if (!LlmStorageService.instance) {
      LlmStorageService.instance = new LlmStorageService();
    }
    return LlmStorageService.instance;
  }

  constructor() {
    // Initialize file storage service for metadata
    const fileSystemBridge = new NodeFileSystemBridge();
    const fileStorage = new FileStorageService<LlmConfigMetadata[]>(
      fileSystemBridge,
    );

    // Initialize Electron secure storage for API keys
    const secureStorage = new LlmSecureStorage();

    // Get configuration file path in userData directory
    const userDataPath = app.getPath("userData");
    const configFilePath = path.join(userDataPath, "llm_config.json");

    // Create repository with both storage services
    this.repository = new LlmConfigRepository(
      fileStorage,
      secureStorage,
      configFilePath,
    );

    this.logger.debug("LlmStorageService initialized", {
      configPath: configFilePath,
      secureStorageAvailable: secureStorage.isAvailable(),
    });
  }

  /**
   * Save a new LLM configuration with secure API key storage.
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
      const input: LlmConfigInput = {
        customName: config.customName,
        provider: config.provider,
        apiKey,
        baseUrl: config.baseUrl,
        authHeaderType: config.authHeaderType,
      };

      const createdConfig = await this.repository.create(input);

      this.logger.debug("LLM configuration saved successfully", {
        configId: createdConfig.id,
        provider: createdConfig.provider,
      });

      return { success: true, data: createdConfig.id };
    } catch (error) {
      const message = this.extractErrorMessage(error);
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
      const input: Partial<LlmConfigInput> = {
        customName: updates.customName,
        provider: updates.provider,
        baseUrl: updates.baseUrl,
        authHeaderType: updates.authHeaderType,
        apiKey: newApiKey,
      };

      // Remove undefined values
      Object.keys(input).forEach((key) => {
        if (input[key as keyof LlmConfigInput] === undefined) {
          delete input[key as keyof LlmConfigInput];
        }
      });

      await this.repository.update(id, input);

      this.logger.debug("LLM configuration updated successfully", {
        configId: id,
        hasNewApiKey: !!newApiKey,
      });

      return { success: true };
    } catch (error) {
      const message = this.extractErrorMessage(error);
      this.logger.error("Failed to update LLM configuration", error as Error);
      return { success: false, error: message };
    }
  }

  /**
   * Get a specific LLM configuration by ID.
   *
   * @param id Configuration ID to retrieve
   * @returns Promise resolving to configuration or error
   */
  async getConfiguration(
    id: string,
  ): Promise<StorageResult<LlmConfigMetadata | null>> {
    try {
      const config = await this.repository.read(id);

      if (!config) {
        return { success: true, data: null };
      }

      // Remove API key to return only metadata
      const { apiKey: _apiKey, ...metadata } = config;

      this.logger.debug("LLM configuration retrieved", { configId: id });

      return { success: true, data: metadata };
    } catch (error) {
      const message = this.extractErrorMessage(error);
      this.logger.error("Failed to get LLM configuration", error as Error);
      return { success: false, error: message };
    }
  }

  /**
   * Get all LLM configurations.
   *
   * @returns Promise resolving to all configurations or error
   */
  async getAllConfigurations(): Promise<StorageResult<LlmConfigMetadata[]>> {
    try {
      const configs = await this.repository.list();

      this.logger.debug("Loaded LLM configurations", { count: configs.length });

      return { success: true, data: configs };
    } catch (error) {
      const message = this.extractErrorMessage(error);
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
      await this.repository.delete(id);

      this.logger.debug("LLM configuration deleted successfully", {
        configId: id,
      });

      return { success: true };
    } catch (error) {
      const message = this.extractErrorMessage(error);
      this.logger.error("Failed to delete LLM configuration", error as Error);
      return { success: false, error: message };
    }
  }

  /**
   * Get complete configuration with decrypted API key (for internal use only).
   * This method should not be exposed via IPC for security reasons.
   *
   * @param id Configuration ID to retrieve
   * @returns Promise resolving to complete config or error
   */
  async getCompleteConfiguration(
    id: string,
  ): Promise<StorageResult<LlmConfig | null>> {
    try {
      const config = await this.repository.read(id);

      if (config) {
        this.logger.debug("Complete LLM configuration retrieved", {
          configId: id,
        });
      }

      return { success: true, data: config };
    } catch (error) {
      const message = this.extractErrorMessage(error);
      this.logger.error(
        "Failed to get complete LLM configuration",
        error as Error,
      );
      return { success: false, error: message };
    }
  }

  /**
   * Check if a configuration exists.
   *
   * @param id Configuration ID to check
   * @returns Promise resolving to existence check result
   */
  async configurationExists(id: string): Promise<StorageResult<boolean>> {
    try {
      const exists = await this.repository.exists(id);
      return { success: true, data: exists };
    } catch (error) {
      const message = this.extractErrorMessage(error);
      this.logger.error(
        "Failed to check configuration existence",
        error as Error,
      );
      return { success: false, error: message };
    }
  }

  /**
   * Check if secure storage is available for API key encryption.
   *
   * @returns true if secure storage is available, false otherwise
   */
  isSecureStorageAvailable(): boolean {
    return this.repository.isSecureStorageAvailable();
  }

  /**
   * Extract error message from various error types.
   * Handles Zod validation errors specially to provide detailed feedback.
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof ZodError) {
      // Format Zod validation errors
      const issues = error.issues.map((issue) => {
        const path = issue.path.join(".");
        return path ? `${path}: ${issue.message}` : issue.message;
      });
      return `Validation failed: ${issues.join(", ")}`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Unknown error occurred";
  }
}
