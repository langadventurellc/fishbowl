import { ZodError } from "zod";
import { createLoggerSync } from "../../logging/createLoggerSync";
import type { LlmProviderDefinition } from "../../types/llm-providers/LlmProviderDefinition";
import { validateProvidersFile } from "../../types/llm-providers/validation/validateProvidersFile";
import { FileStorageService } from "../storage/FileStorageService";
import { FileNotFoundError } from "../storage/errors/FileNotFoundError";
import { ConfigurationCache } from "./cache/ConfigurationCache";
import { ConfigurationLoadError } from "./errors/ConfigurationLoadError";
import type { ValidationErrorDetail } from "./errors/ValidationErrorDetail";
import type { LoaderOptions } from "./types/LoaderOptions";

/**
 * Service for loading and managing LLM provider configurations from JSON files.
 * Provides caching, hot-reload support for development, and comprehensive error handling.
 */
export class LlmConfigurationLoader {
  private cache: ConfigurationCache;
  private fileStorage: FileStorageService;
  private isInitialized: boolean = false;
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "LlmConfigurationLoader" } },
  });

  constructor(
    private filePath: string,
    options: LoaderOptions = {},
  ) {
    this.fileStorage = new FileStorageService();
    this.cache = new ConfigurationCache(options.cacheEnabled ?? true);
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
    const config = this.cache.get(this.filePath);
    return config?.providers ?? [];
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
    this.cache.invalidate(this.filePath);
    await this.loadConfiguration();
  }

  /**
   * Clean up resources when done with the loader.
   */
  dispose(): void {
    this.cache.clear();
  }

  /**
   * Load and validate configuration from the JSON file.
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const startTime = Date.now();

      // Check cache first
      if (this.cache.has(this.filePath)) {
        this.logger.debug("Using cached configuration");
        return;
      }

      // Read file
      const rawData = await this.fileStorage.readJsonFile(this.filePath);

      // Validate with detailed errors
      const validationResult = validateProvidersFile(rawData);

      if (!validationResult.success) {
        throw new ConfigurationLoadError(
          "Invalid configuration file format",
          this.filePath,
          this.formatValidationErrors(validationResult.error),
        );
      }

      // Cache validated data
      this.cache.set(this.filePath, validationResult.data);

      const loadTime = Date.now() - startTime;
      this.logger.info(`Configuration loaded in ${loadTime}ms`, {
        providers: validationResult.data.providers.length,
        version: validationResult.data.version,
      });
    } catch (error) {
      if (error instanceof FileNotFoundError) {
        // Graceful degradation for missing files
        this.logger.warn(
          "Configuration file not found, using empty provider list",
        );
        this.cache.set(this.filePath, {
          version: "1.0.0",
          providers: [],
        });
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
   * Convert Zod validation errors to structured format.
   */
  private formatValidationErrors(zodError: ZodError): ValidationErrorDetail[] {
    return zodError.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));
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
