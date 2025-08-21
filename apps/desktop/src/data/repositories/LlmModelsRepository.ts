import * as path from "path";
import {
  PersistedLlmModelsSettingsData,
  persistedLlmModelsSettingsSchema,
  createLoggerSync,
  FileStorageService,
  FileStorageError,
  createDefaultLlmModelsSettings,
} from "@fishbowl-ai/shared";
import { NodeFileSystemBridge } from "../../main/services/NodeFileSystemBridge";
import { NodeCryptoUtils } from "../../main/utils/NodeCryptoUtils";
import { NodePathUtils } from "../../main/utils/NodePathUtils";

/**
 * Repository for managing LLM models data persistence in the desktop application.
 * Handles file operations for llmModels.json with atomic writes, validation, and error handling.
 * Follows the same patterns as PersonalitiesRepository but specialized for LLM models data.
 */
export class LlmModelsRepository {
  private static readonly DEFAULT_LLM_MODELS_FILE_NAME = "llmModels.json";
  private readonly filePath: string;
  private readonly fileStorageService: FileStorageService;
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "LlmModelsRepository" } },
  });

  /**
   * Create LLM models repository with data path for file operations.
   *
   * @param dataPath Directory path where llmModels.json should be stored
   */
  constructor(dataPath: string) {
    this.filePath = path.join(
      dataPath,
      LlmModelsRepository.DEFAULT_LLM_MODELS_FILE_NAME,
    );
    const fileSystemBridge = new NodeFileSystemBridge();
    const cryptoUtils = new NodeCryptoUtils();
    const pathUtils = new NodePathUtils();
    this.fileStorageService = new FileStorageService(
      fileSystemBridge,
      cryptoUtils,
      pathUtils,
    );
  }

  /**
   * Load LLM models from storage. Creates default models if file doesn't exist.
   * Automatically saves default models to file for future loads.
   *
   * @returns Promise resolving to LLM models data (default models if file not found)
   * @throws FileStorageError for file system issues other than file not found
   * @throws Error for JSON parsing or validation failures
   */
  async loadLlmModels(): Promise<PersistedLlmModelsSettingsData> {
    try {
      this.logger.debug("Loading LLM models from file", {
        filePath: this.filePath,
      });

      const rawLlmModels = await this.fileStorageService.readJsonFile<unknown>(
        this.filePath,
      );

      const validatedLlmModels = this.validateLlmModels(rawLlmModels);

      this.logger.debug("LLM models loaded successfully", {
        providerCount: validatedLlmModels.providers?.length || 0,
      });

      return validatedLlmModels;
    } catch (error) {
      // Handle file not found by creating defaults
      if (error instanceof FileStorageError && error.operation === "read") {
        this.logger.debug("LLM models file not found, creating with defaults");

        const defaultLlmModels = createDefaultLlmModelsSettings();

        // Save defaults to file for future loads
        try {
          await this.saveLlmModels(defaultLlmModels);
          this.logger.debug("Default LLM models saved successfully", {
            providerCount: defaultLlmModels.providers?.length || 0,
          });
        } catch (saveError) {
          // Log but don't throw - return defaults even if save fails
          this.logger.warn("Failed to save default LLM models", {
            error: saveError as Error,
          });
        }

        return defaultLlmModels;
      }

      this.logger.error("Failed to load LLM models", error as Error);
      throw this.mapError(error, "load");
    }
  }

  /**
   * Save LLM models to storage with atomic write operation.
   * Validates data before saving and creates directory if needed.
   *
   * @param llmModels LLM models data to persist
   * @returns Promise resolving when save is complete
   * @throws FileStorageError for file system issues
   * @throws Error for validation failures
   */
  async saveLlmModels(
    llmModels: PersistedLlmModelsSettingsData,
  ): Promise<void> {
    try {
      this.logger.debug("Saving LLM models to file", {
        filePath: this.filePath,
        providerCount: llmModels.providers?.length || 0,
      });

      // Validate before saving
      const validatedLlmModels = this.validateLlmModels(llmModels);

      // Update timestamp
      const llmModelsWithTimestamp = {
        ...validatedLlmModels,
        lastUpdated: new Date().toISOString(),
      };

      // Save atomically using FileStorageService
      await this.fileStorageService.writeJsonFile(
        this.filePath,
        llmModelsWithTimestamp,
      );

      this.logger.debug("LLM models saved successfully");
    } catch (error) {
      this.logger.error("Failed to save LLM models", error as Error);
      throw this.mapError(error, "save");
    }
  }

  /**
   * Reset LLM models by loading defaults and saving them to file.
   * Creates default LLM models using createDefaultLlmModelsSettings and saves them.
   *
   * @returns Promise resolving when reset is complete
   * @throws Error for default creation or save failures
   */
  async resetLlmModels(): Promise<void> {
    try {
      this.logger.info("Resetting LLM models to defaults", {
        filePath: this.filePath,
      });

      // Load default LLM models
      const defaultLlmModels = createDefaultLlmModelsSettings();

      this.logger.debug("Default LLM models created", {
        providerCount: defaultLlmModels.providers?.length || 0,
      });

      // Save defaults using saveLlmModels method
      await this.saveLlmModels(defaultLlmModels);

      this.logger.info("LLM models reset to defaults successfully");
    } catch (error) {
      this.logger.error("Failed to reset LLM models", error as Error);
      throw this.mapError(error, "reset");
    }
  }

  /**
   * Validate and parse unknown data into typed LLM models settings.
   * Ensures data structure is correct and applies schema validation.
   *
   * @param llmModels Unknown data to validate
   * @returns Validated and typed LLM models settings
   * @throws Error for validation failures
   */
  private validateLlmModels(
    llmModels: unknown,
  ): PersistedLlmModelsSettingsData {
    try {
      // Ensure we have an object structure
      if (
        !llmModels ||
        typeof llmModels !== "object" ||
        Array.isArray(llmModels)
      ) {
        throw new Error("LLM models data must be an object");
      }

      // Validate with Zod schema
      const result = persistedLlmModelsSettingsSchema.safeParse(llmModels);

      if (!result.success) {
        const errorMessages = result.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        throw new Error(`LLM models validation failed: ${errorMessages}`);
      }

      return result.data;
    } catch (error) {
      this.logger.error("LLM models validation failed", error as Error);
      throw error;
    }
  }

  /**
   * Map file system errors to appropriate error types with context.
   * Hides internal file paths from error messages for security.
   *
   * @param error Original error from file operations
   * @param operation Operation that failed (load, save, reset)
   * @returns Mapped error with appropriate context
   */
  private mapError(error: unknown, operation: string): Error {
    if (error instanceof Error) {
      // Map common file system errors
      if ("code" in error) {
        switch ((error as { code: string }).code) {
          case "ENOENT":
            return new Error(`LLM models file not found during ${operation}`);
          case "EPERM":
          case "EACCES":
            return new Error(
              `Permission denied during LLM models ${operation}`,
            );
          case "ENOSPC":
            return new Error(
              `Insufficient disk space for LLM models ${operation}`,
            );
          default:
            break;
        }
      }

      // Return error with operation context, but hide file path
      return new Error(`Failed to ${operation} LLM models: ${error.message}`);
    }

    return new Error(`Failed to ${operation} LLM models: Unknown error`);
  }
}
