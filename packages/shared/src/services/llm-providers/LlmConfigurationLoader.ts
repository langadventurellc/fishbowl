import { createLoggerSync } from "../../logging/createLoggerSync";
import type { LlmProviderDefinition } from "../../types/llm-providers/LlmProviderDefinition";
import type { InferredLlmProvidersFile } from "../../types/llm-providers/validation/InferredLlmProvidersFile";
import { FileStorageService } from "../storage/FileStorageService";
import { FileNotFoundError } from "../storage/errors/FileNotFoundError";
import { ConfigurationCache } from "./cache/ConfigurationCache";
import { ConfigurationLoadError } from "./errors/ConfigurationLoadError";
import type { LoaderOptions } from "./types/LoaderOptions";
import { ConfigurationValidator } from "./validation/ConfigurationValidator";
import type { ValidationOptions } from "./validation/ValidationOptions";

/**
 * Service for loading and managing LLM provider configurations from JSON files.
 * Provides caching, hot-reload support for development, and comprehensive error handling.
 */
export class LlmConfigurationLoader {
  private cache: ConfigurationCache;
  private fileStorage: FileStorageService;
  private validator: ConfigurationValidator;
  private isInitialized: boolean = false;
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "LlmConfigurationLoader" } },
  });

  constructor(
    private filePath: string,
    _options: LoaderOptions = {},
  ) {
    this.fileStorage = new FileStorageService();
    this.cache = new ConfigurationCache();

    const validationOptions: ValidationOptions = {
      mode: this.isDevelopment() ? "development" : "production",
      includeStackTrace: this.isDevelopment(),
      includeRawData: this.isDevelopment(),
      maxErrorCount: 20,
      enableWarnings: true,
    };

    this.validator = new ConfigurationValidator(validationOptions);
  }

  /**
   * Initialize the loader and perform initial configuration loading.
   * Must be called before using other methods.
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.debug("Loader already initialized, skipping");
      return;
    }

    await this.loadConfiguration();

    this.isInitialized = true;
    this.logger.info("LlmConfigurationLoader initialized", {
      filePath: this.filePath,
    });
  }

  /**
   * Get all available LLM provider configurations.
   * @returns Array of validated provider definitions
   */
  async getProviders(): Promise<LlmProviderDefinition[]> {
    this.ensureInitialized();
    return this.cache.get() ?? [];
  }

  /**
   * Get a specific provider by ID.
   * @param id Provider identifier
   * @returns Provider definition or undefined if not found
   */
  async getProvider(id: string): Promise<LlmProviderDefinition | undefined> {
    this.ensureInitialized();
    const providers = await this.getProviders();
    return providers.find((p) => p.id === id);
  }

  /**
   * Get available models for a specific provider.
   * @param id Provider identifier
   * @returns Map of model ID to display name
   */
  async getModelsForProvider(id: string): Promise<Record<string, string>> {
    this.ensureInitialized();
    const provider = await this.getProvider(id);
    return provider?.models ?? {};
  }

  /**
   * Reload configuration from file (used for hot-reload).
   */
  async reload(): Promise<void> {
    this.logger.debug("Reloading configuration");
    this.cache.invalidate();
    await this.loadConfiguration();
  }

  /**
   * Clean up resources when done with the loader.
   */
  dispose(): void {
    this.cache.invalidate();
  }

  /**
   * Load and validate configuration from the JSON file.
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const startTime = Date.now();

      // Check cache first
      if (this.cache.isValid()) {
        this.logger.debug("Using cached configuration");
        return;
      }

      // Use new validator for comprehensive validation
      const validationResult = await this.validator.validateConfigurationFile(
        this.filePath,
      );

      if (!validationResult.isValid) {
        const errorMessage = this.isDevelopment()
          ? this.validator.createUserFriendlyError(validationResult.errors)
          : "Invalid configuration file format";

        throw new ConfigurationLoadError(
          errorMessage,
          this.filePath,
          validationResult.errors?.map((e) => ({
            path: e.path,
            message: e.message,
            code: e.code,
          })),
        );
      }

      // Log warnings if present
      if (validationResult.warnings && validationResult.warnings.length > 0) {
        validationResult.warnings.forEach((warning) => {
          this.logger.warn(`Configuration warning: ${warning.message}`, {
            type: warning.type,
            path: warning.path,
          });
        });
      }

      // Cache validated data
      const providersFile = validationResult.data as InferredLlmProvidersFile;
      this.cache.set(providersFile.providers);

      const loadTime = Date.now() - startTime;
      this.logger.info(`Configuration loaded in ${loadTime}ms`, {
        providers: validationResult.metadata?.providerCount,
        version: validationResult.metadata?.schemaVersion,
        warnings: validationResult.warnings?.length || 0,
      });
    } catch (error) {
      if (error instanceof FileNotFoundError) {
        // Graceful degradation for missing files
        this.logger.warn(
          "Configuration file not found, using empty provider list",
        );
        this.cache.set([]);
        return;
      }

      throw error;
    }
  }

  /**
   * Handle file change events from the watcher.
   */
  private async handleFileChange(): Promise<void> {
    try {
      await this.reload();
      this.logger.info("Configuration reloaded successfully");
    } catch (error) {
      this.logger.error("Failed to reload configuration", error as Error);
    }
  }

  /**
   * Check if running in development environment.
   */
  private isDevelopment(): boolean {
    return process.env.NODE_ENV === "development";
  }

  /**
   * Ensure the loader has been initialized before use.
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(
        "LlmConfigurationLoader not initialized. Call initialize() first.",
      );
    }
  }
}
