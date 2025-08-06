import { app } from "electron";
import * as path from "path";
import {
  LlmConfigRepository,
  FileStorageService,
  NodeFileSystemBridge,
  type LlmConfigMetadata,
  type StorageResult,
  createLoggerSync,
} from "@fishbowl-ai/shared";
import { LlmSecureStorage } from "./LlmSecureStorage";

/**
 * Unified LLM storage service for the Fishbowl desktop application.
 *
 * Coordinates between secure API key storage and configuration metadata storage
 * using the shared LlmConfigRepository and Electron-specific secure storage.
 * Provides a single interface for all LLM configuration operations.
 */
export class LlmStorageService {
  private repository: LlmConfigRepository;
  private logger = createLoggerSync({
    context: { metadata: { component: "LlmStorageService" } },
  });

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
    return await this.repository.saveConfiguration(config, apiKey);
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
    return await this.repository.updateConfiguration(id, updates, newApiKey);
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
    return await this.repository.getConfiguration(id);
  }

  /**
   * Get all LLM configurations.
   *
   * @returns Promise resolving to all configurations or error
   */
  async getAllConfigurations(): Promise<StorageResult<LlmConfigMetadata[]>> {
    return await this.repository.getAllConfigurations();
  }

  /**
   * Delete an LLM configuration completely.
   * Removes both metadata and API key from their respective storages.
   *
   * @param id Configuration ID to delete
   * @returns Promise resolving to success/error result
   */
  async deleteConfiguration(id: string): Promise<StorageResult<void>> {
    return await this.repository.deleteConfiguration(id);
  }

  /**
   * Check if secure storage is available for API key encryption.
   *
   * @returns true if secure storage is available, false otherwise
   */
  isSecureStorageAvailable(): boolean {
    return this.repository.isSecureStorageAvailable();
  }
}
