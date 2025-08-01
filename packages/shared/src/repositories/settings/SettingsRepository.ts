import type { SettingsRepositoryInterface } from "./SettingsRepositoryInterface";
import type { PersistedSettings } from "../../types/settings/PersistedSettings";
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

/**
 * Repository for settings persistence operations.
 *
 * Implements the repository pattern to coordinate between file storage service
 * and type system, providing a clean API for loading and saving user settings.
 * Handles schema validation, default value application, and atomic updates.
 */
export class SettingsRepository implements SettingsRepositoryInterface {
  private static readonly SETTINGS_FILE_NAME = "preferences.json";

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
  async loadSettings(): Promise<PersistedSettings> {
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
  async saveSettings(settings: Partial<PersistedSettings>): Promise<void> {
    try {
      // Load current settings (creates defaults if missing)
      const currentSettings = await this.loadSettings();

      // Deep merge with current settings
      const mergedSettings = deepMerge(
        currentSettings as unknown as Record<string, unknown>,
        settings as unknown as Partial<Record<string, unknown>>,
      ) as unknown as PersistedSettings;

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
  getDefaultSettings(): PersistedSettings {
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
  validateSettings(settings: unknown): PersistedSettings {
    try {
      const result = persistedSettingsSchema.parse(settings);
      return result;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new SettingsValidationError(
          SettingsRepository.SETTINGS_FILE_NAME,
          "validation",
          error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
          error,
        );
      }

      throw new SettingsValidationError(
        SettingsRepository.SETTINGS_FILE_NAME,
        "validation",
        [{ path: "", message: "Unknown validation error" }],
        error as Error,
      );
    }
  }

  /**
   * Save default settings to file for first-time setup.
   * Private helper method to ensure defaults are persisted.
   *
   * @param defaults Default settings to save
   */
  private async saveDefaultsToFile(defaults: PersistedSettings): Promise<void> {
    try {
      await this.fileStorageService.writeJsonFile(
        SettingsRepository.SETTINGS_FILE_NAME,
        defaults,
      );
    } catch (error) {
      // Log but don't throw - application can still work with in-memory defaults
      console.warn("Failed to save default settings to file:", error);
    }
  }
}
