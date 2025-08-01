import type { PersistedSettings } from "../../types/settings/PersistedSettings";

/**
 * Interface for settings repository operations.
 *
 * Provides a clean API for loading, saving, and validating user settings.
 * Coordinates between file storage and type validation systems to ensure
 * data integrity and consistency.
 */
export interface SettingsRepositoryInterface {
  /**
   * Load settings from storage with validation and defaults applied.
   * Creates default settings file if none exists.
   *
   * @returns Promise resolving to complete validated settings
   * @throws FileStorageError for file system issues
   * @throws SettingsValidationError for validation failures
   */
  loadSettings(): Promise<PersistedSettings>;

  /**
   * Save partial settings updates to storage with validation.
   * Merges updates with existing settings and validates before persistence.
   *
   * @param settings Partial settings to update
   * @returns Promise resolving when save is complete
   * @throws FileStorageError for file system issues
   * @throws SettingsValidationError for validation failures
   */
  saveSettings(settings: Partial<PersistedSettings>): Promise<void>;

  /**
   * Get default settings without I/O operations.
   * Returns complete default configuration instantly.
   *
   * @returns Complete default settings object
   */
  getDefaultSettings(): PersistedSettings;

  /**
   * Validate and parse unknown data into typed settings.
   * Applies defaults for missing fields and validates structure.
   *
   * @param settings Unknown data to validate
   * @returns Validated and typed settings object
   * @throws SettingsValidationError for validation failures
   */
  validateSettings(settings: unknown): PersistedSettings;
}
