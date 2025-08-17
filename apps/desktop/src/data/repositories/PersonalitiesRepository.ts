import * as path from "path";
import {
  PersistedPersonalitiesSettingsData,
  persistedPersonalitiesSettingsSchema,
  createLoggerSync,
  FileStorageService,
  FileStorageError,
  createDefaultPersonalitiesSettings,
} from "@fishbowl-ai/shared";
import { NodeFileSystemBridge } from "../../main/services/NodeFileSystemBridge";
import { NodeCryptoUtils } from "../../main/utils/NodeCryptoUtils";
import { NodePathUtils } from "../../main/utils/NodePathUtils";

/**
 * Repository for managing personalities data persistence in the desktop application.
 * Handles file operations for personalities.json with atomic writes, validation, and error handling.
 * Follows the same patterns as RolesRepository but specialized for personalities data.
 */
export class PersonalitiesRepository {
  private static readonly DEFAULT_PERSONALITIES_FILE_NAME =
    "personalities.json";
  private readonly filePath: string;
  private readonly fileStorageService: FileStorageService;
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "PersonalitiesRepository" } },
  });

  /**
   * Create personalities repository with data path for file operations.
   *
   * @param dataPath Directory path where personalities.json should be stored
   */
  constructor(dataPath: string) {
    this.filePath = path.join(
      dataPath,
      PersonalitiesRepository.DEFAULT_PERSONALITIES_FILE_NAME,
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
   * Load personalities from storage.
   * Returns null if file doesn't exist (ENOENT error).
   *
   * @returns Promise resolving to personalities data or null if file not found
   * @throws FileStorageError for file system issues other than file not found
   * @throws Error for JSON parsing or validation failures
   */
  async loadPersonalities(): Promise<PersistedPersonalitiesSettingsData | null> {
    try {
      this.logger.debug("Loading personalities from file", {
        filePath: this.filePath,
      });

      const rawPersonalities =
        await this.fileStorageService.readJsonFile<unknown>(this.filePath);

      const validatedPersonalities =
        this.validatePersonalities(rawPersonalities);

      this.logger.debug("Personalities loaded successfully", {
        personalityCount: validatedPersonalities.personalities?.length || 0,
      });

      return validatedPersonalities;
    } catch (error) {
      // Handle file not found by returning null
      if (error instanceof FileStorageError && error.operation === "read") {
        this.logger.debug("Personalities file not found", {
          filePath: this.filePath,
        });
        return null;
      }

      this.logger.error("Failed to load personalities", error as Error);
      throw this.mapError(error, "load");
    }
  }

  /**
   * Save personalities to storage with atomic write operation.
   * Validates data before saving and creates directory if needed.
   *
   * @param personalities Personalities data to persist
   * @returns Promise resolving when save is complete
   * @throws FileStorageError for file system issues
   * @throws Error for validation failures
   */
  async savePersonalities(
    personalities: PersistedPersonalitiesSettingsData,
  ): Promise<void> {
    try {
      this.logger.debug("Saving personalities to file", {
        filePath: this.filePath,
        personalityCount: personalities.personalities?.length || 0,
      });

      // Validate before saving
      const validatedPersonalities = this.validatePersonalities(personalities);

      // Update timestamp
      const personalitiesWithTimestamp = {
        ...validatedPersonalities,
        lastUpdated: new Date().toISOString(),
      };

      // Save atomically using FileStorageService
      await this.fileStorageService.writeJsonFile(
        this.filePath,
        personalitiesWithTimestamp,
      );

      this.logger.debug("Personalities saved successfully");
    } catch (error) {
      this.logger.error("Failed to save personalities", error as Error);
      throw this.mapError(error, "save");
    }
  }

  /**
   * Reset personalities by loading defaults and saving them to file.
   * Creates default personalities using createDefaultPersonalitiesSettings and saves them.
   *
   * @returns Promise resolving when reset is complete
   * @throws Error for default creation or save failures
   */
  async resetPersonalities(): Promise<void> {
    try {
      this.logger.info("Resetting personalities to defaults", {
        filePath: this.filePath,
      });

      // Load default personalities
      const defaultPersonalities = createDefaultPersonalitiesSettings();

      this.logger.debug("Default personalities created", {
        personalityCount: defaultPersonalities.personalities?.length || 0,
      });

      // Save defaults using savePersonalities method
      await this.savePersonalities(defaultPersonalities);

      this.logger.info("Personalities reset to defaults successfully");
    } catch (error) {
      this.logger.error("Failed to reset personalities", error as Error);
      throw this.mapError(error, "reset");
    }
  }

  /**
   * Validate and parse unknown data into typed personalities settings.
   * Ensures data structure is correct and applies schema validation.
   *
   * @param personalities Unknown data to validate
   * @returns Validated and typed personalities settings
   * @throws Error for validation failures
   */
  private validatePersonalities(
    personalities: unknown,
  ): PersistedPersonalitiesSettingsData {
    try {
      // Ensure we have an object structure
      if (
        !personalities ||
        typeof personalities !== "object" ||
        Array.isArray(personalities)
      ) {
        throw new Error("Personalities data must be an object");
      }

      // Validate with Zod schema
      const result =
        persistedPersonalitiesSettingsSchema.safeParse(personalities);

      if (!result.success) {
        const errorMessages = result.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        throw new Error(`Personalities validation failed: ${errorMessages}`);
      }

      return result.data;
    } catch (error) {
      this.logger.error("Personalities validation failed", error as Error);
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
            return new Error(
              `Personalities file not found during ${operation}`,
            );
          case "EPERM":
          case "EACCES":
            return new Error(
              `Permission denied during personalities ${operation}`,
            );
          case "ENOSPC":
            return new Error(
              `Insufficient disk space for personalities ${operation}`,
            );
          default:
            break;
        }
      }

      // Return error with operation context, but hide file path
      return new Error(
        `Failed to ${operation} personalities: ${error.message}`,
      );
    }

    return new Error(`Failed to ${operation} personalities: Unknown error`);
  }
}
