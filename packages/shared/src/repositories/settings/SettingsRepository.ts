import type { SettingsRepositoryInterface } from "./SettingsRepositoryInterface";
import type { PersistedSettingsData } from "../../types/settings/PersistedSettingsData";
import { FileStorageService } from "../../services/storage/FileStorageService";
import { createDefaultPersistedSettings } from "../../types/settings/createDefaultPersistedSettings";
import { persistedSettingsSchema } from "../../types/settings/persistedSettingsSchema";
import { deepMerge } from "../../services/storage/utils/deepMerge";
import {
  FileStorageError,
  SettingsValidationError,
  WritePermissionError,
} from "../../services/storage/errors";
import { ZodError } from "zod";
import { CURRENT_SCHEMA_VERSION } from "../../types/settings/persistedSettingsSchema";
import { createLoggerSync } from "../../logging/createLoggerSync";

/**
 * Repository for settings persistence operations.
 *
 * Implements the repository pattern to coordinate between file storage service
 * and type system, providing a clean API for loading and saving user settings.
 * Handles schema validation, default value application, and atomic updates.
 */
export class SettingsRepository implements SettingsRepositoryInterface {
  private static readonly SETTINGS_FILE_NAME = "preferences.json";
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "SettingsRepository" } },
  });

  /**
   * Create settings repository with file storage dependency.
   *
   * @param fileStorageService File storage service for JSON operations
   */
  constructor(private fileStorageService: FileStorageService) {}

  /**
   * Load settings from storage with validation and defaults applied.
   * Creates default settings file if none exists.
   *
   * @returns Promise resolving to complete validated settings
   * @throws FileStorageError for file system issues
   * @throws SettingsValidationError for validation failures
   */
  async loadSettings(): Promise<PersistedSettingsData> {
    try {
      const rawSettings = await this.fileStorageService.readJsonFile<unknown>(
        SettingsRepository.SETTINGS_FILE_NAME,
      );

      return this.validateSettings(rawSettings);
    } catch (error) {
      // Handle file not found by returning defaults
      if (error instanceof FileStorageError && error.operation === "read") {
        const defaults = this.getDefaultSettings();

        // Save defaults to file for future loads
        await this.saveDefaultsToFile(defaults);

        return defaults;
      }

      // Re-throw storage errors and validation errors
      throw error;
    }
  }

  /**
   * Save partial settings updates to storage with validation.
   * Merges updates with existing settings and validates before persistence.
   *
   * @param settings Partial settings to update
   * @returns Promise resolving when save is complete
   * @throws FileStorageError for file system issues
   * @throws SettingsValidationError for validation failures
   */
  async saveSettings(settings: Partial<PersistedSettingsData>): Promise<void> {
    try {
      // Load current settings (creates defaults if missing)
      const currentSettings = await this.loadSettings();

      // Deep merge with current settings
      const mergedSettings = deepMerge(
        currentSettings as unknown as Record<string, unknown>,
        settings as unknown as Partial<Record<string, unknown>>,
      ) as unknown as PersistedSettingsData;

      // Update lastUpdated timestamp
      const settingsWithTimestamp = {
        ...mergedSettings,
        lastUpdated: new Date().toISOString(),
      };

      // Validate merged settings
      const validatedSettings = this.validateSettings(settingsWithTimestamp);

      // Save atomically
      await this.fileStorageService.writeJsonFile(
        SettingsRepository.SETTINGS_FILE_NAME,
        validatedSettings,
      );
    } catch (error) {
      // Re-throw storage errors and validation errors
      if (
        error instanceof FileStorageError ||
        error instanceof SettingsValidationError
      ) {
        throw error;
      }

      // Wrap unexpected errors
      throw new WritePermissionError(
        SettingsRepository.SETTINGS_FILE_NAME,
        "writeJsonFile",
        error as Error,
      );
    }
  }

  /**
   * Get default settings without I/O operations.
   * Returns complete default configuration instantly.
   *
   * @returns Complete default settings object
   */
  getDefaultSettings(): PersistedSettingsData {
    return createDefaultPersistedSettings();
  }

  /**
   * Validate and parse unknown data into typed settings.
   * Applies defaults for missing fields and validates structure.
   *
   * @param settings Unknown data to validate
   * @returns Validated and typed settings object
   * @throws SettingsValidationError for validation failures
   */
  validateSettings(settings: unknown): PersistedSettingsData {
    try {
      // First ensure we have an object structure (not array, null, or primitive)
      if (
        !settings ||
        typeof settings !== "object" ||
        Array.isArray(settings)
      ) {
        throw new SettingsValidationError(
          SettingsRepository.SETTINGS_FILE_NAME,
          "validation",
          [{ path: "root", message: "Settings must be an object" }],
          new Error("Invalid settings format"),
        );
      }

      // Check for schema version mismatch and warn if needed
      this.handleSchemaVersionMismatch(settings);

      // Ensure all required fields are present with defaults
      const completeSettings = this.ensureCompleteSettings(settings);

      // Validate with Zod schema using safeParse for better error handling
      const result = persistedSettingsSchema.safeParse(completeSettings);

      if (!result.success) {
        const fieldErrors = this.formatZodErrors(result.error);
        throw new SettingsValidationError(
          SettingsRepository.SETTINGS_FILE_NAME,
          "validation",
          fieldErrors,
          result.error,
        );
      }

      return result.data;
    } catch (error) {
      // Re-throw SettingsValidationError as-is
      if (error instanceof SettingsValidationError) {
        throw error;
      }

      // Wrap other errors
      throw new SettingsValidationError(
        SettingsRepository.SETTINGS_FILE_NAME,
        "validation",
        [
          {
            path: "root",
            message:
              error instanceof Error
                ? error.message
                : "Unexpected validation error",
          },
        ],
        error as Error,
      );
    }
  }

  /**
   * Ensures settings have all required fields filled with defaults.
   * Uses deep merge to combine partial settings with complete defaults.
   *
   * @param partialSettings Partial settings data to merge with defaults
   * @returns Complete settings with all fields populated
   */
  private ensureCompleteSettings(
    partialSettings: unknown,
  ): PersistedSettingsData {
    const defaults = this.getDefaultSettings();

    // Handle non-object input by returning defaults
    if (!partialSettings || typeof partialSettings !== "object") {
      return defaults;
    }

    // Deep merge partial settings with defaults
    const merged = deepMerge(
      defaults as unknown as Record<string, unknown>,
      partialSettings as Record<string, unknown>,
    ) as unknown as PersistedSettingsData;

    // Ensure timestamps are updated
    merged.lastUpdated = new Date().toISOString();

    return merged;
  }

  /**
   * Formats Zod validation errors into user-friendly field error messages.
   *
   * @param zodError Zod validation error with detailed issues
   * @returns Array of formatted field errors with paths and messages
   */
  private formatZodErrors(
    zodError: ZodError,
  ): Array<{ path: string; message: string }> {
    return zodError.issues.map((issue) => {
      const path = issue.path.join(".");
      const message = issue.message;

      return {
        path: path || "root",
        message,
      };
    });
  }

  /**
   * Handles schema version mismatches by logging warnings.
   * Prepares for future migration logic without failing validation.
   *
   * @param settings Settings object to check for version
   */
  private handleSchemaVersionMismatch(settings: unknown): void {
    if (
      settings &&
      typeof settings === "object" &&
      "schemaVersion" in settings
    ) {
      const dataVersion = (settings as Record<string, unknown>).schemaVersion;
      if (dataVersion && dataVersion !== CURRENT_SCHEMA_VERSION) {
        this.logger.warn(
          `Settings schema version mismatch. Current: ${CURRENT_SCHEMA_VERSION}, Data: ${dataVersion}. ` +
            "Migration may be needed in the future.",
        );
      }
    }
  }

  /**
   * Save default settings to file for first-time setup.
   * Private helper method to ensure defaults are persisted.
   *
   * @param defaults Default settings to save
   */
  private async saveDefaultsToFile(
    defaults: PersistedSettingsData,
  ): Promise<void> {
    try {
      await this.fileStorageService.writeJsonFile(
        SettingsRepository.SETTINGS_FILE_NAME,
        defaults,
      );
    } catch (error) {
      // Log but don't throw - application can still work with in-memory defaults
      this.logger.warn("Failed to save default settings to file", { error });
    }
  }
}
