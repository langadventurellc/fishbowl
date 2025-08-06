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
import { ResilienceLayer } from "./resilience/ResilienceLayer";
import type { ConfigurationStatus } from "./types/ConfigurationStatus";
import type { ResilienceMetrics } from "./resilience/ResilienceMetrics";
import { CircuitState } from "./resilience/CircuitState";

/**
 * Service for loading and managing LLM provider configurations from JSON files.
 * Provides caching, hot-reload support for development, and comprehensive error handling.
 */
export class LlmConfigurationLoader {
  private cache: ConfigurationCache;
  private fileStorage: FileStorageService;
  private validator: ConfigurationValidator;
  private resilienceLayer: ResilienceLayer;
  private isInitialized: boolean = false;
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "LlmConfigurationLoader" } },
  });

  constructor(
    private filePath: string,
    private options: LoaderOptions = {},
  ) {
    this.fileStorage = new FileStorageService();

    // Initialize cache with options
    this.cache = new ConfigurationCache();

    // Merge validation options
    const validationOptions: ValidationOptions = {
      mode: this.isDevelopment() ? "development" : "production",
      includeStackTrace: this.isDevelopment(),
      includeRawData: this.isDevelopment(),
      maxErrorCount: 20,
      enableWarnings: true,
      ...options.validation,
    };

    this.validator = new ConfigurationValidator(validationOptions);

    // Configure resilience with backward compatibility
    const resilienceOptions = options.resilience ?? {
      retry: {
        maxAttempts: options.retryAttempts ?? 3,
        baseDelayMs: options.retryDelay ?? 1000,
      },
      circuitBreaker: {
        failureThreshold: 5,
        recoveryTimeoutMs: 60000,
      },
      fallback: {
        maxAge: 300000,
        enablePersistence: false,
      },
    };

    this.resilienceLayer = new ResilienceLayer(resilienceOptions);

    // Configure logging if specified
    if (options.logging?.level) {
      // Note: Logging level configuration would be implemented here
      this.logger.debug("Custom logging configuration applied", {
        level: options.logging.level,
        includeMetrics: options.logging.includeMetrics,
      });
    }
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
   * Check if the loader is ready to serve requests.
   */
  isReady(): boolean {
    return this.isInitialized && this.cache.isValid();
  }

  /**
   * Get the last time configuration was updated.
   */
  getLastUpdated(): Date | null {
    return this.cache.getLastUpdated();
  }

  /**
   * Get comprehensive configuration status.
   */
  getConfiguration(): ConfigurationStatus {
    const metrics = this.resilienceLayer.getMetrics();

    return {
      isInitialized: this.isInitialized,
      lastLoaded: this.cache.getLastUpdated(),
      providerCount: this.cache.getProviderIds().length,
      hasValidationErrors: false, // Will be updated based on last validation
      cacheSize: this.cache.getProviderIds().length,
      filePath: this.filePath,
      fileExists: true, // TODO: Add fileExists check when available
      resilience: {
        retryCount: metrics.retryAttempts,
        circuitBreakerState: CircuitState.CLOSED, // TODO: Get actual circuit breaker state
        hasFallback: false, // TODO: Check fallback availability
      },
      cache: {
        isValid: this.cache.isValid(),
        isEmpty: this.cache.isEmpty(),
        lastUpdated: this.cache.getLastUpdated(),
      },
    };
  }

  /**
   * Get resilience metrics.
   */
  getMetrics(): ResilienceMetrics {
    return this.resilienceLayer.getMetrics();
  }

  /**
   * Load and validate configuration from the JSON file.
   */
  private async loadConfiguration(): Promise<void> {
    const startTime = Date.now();

    // Check cache first
    if (this.cache.isValid()) {
      this.logger.debug("Using cached configuration");
      return;
    }

    const loadOperation = async (): Promise<LlmProviderDefinition[]> => {
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

      if (validationResult.warnings && validationResult.warnings.length > 0) {
        validationResult.warnings.forEach((warning) => {
          this.logger.warn(`Configuration warning: ${warning.message}`, {
            type: warning.type,
            path: warning.path,
          });
        });
      }

      const providersFile = validationResult.data as InferredLlmProvidersFile;
      return providersFile.providers;
    };

    try {
      const providers = await this.resilienceLayer.loadWithResilience(
        this.filePath,
        loadOperation,
      );

      this.cache.set(providers);

      const loadTime = Date.now() - startTime;
      this.logger.info(`Configuration loaded in ${loadTime}ms`, {
        providers: providers.length,
        loadTime,
      });
    } catch (error) {
      if (error instanceof FileNotFoundError) {
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
