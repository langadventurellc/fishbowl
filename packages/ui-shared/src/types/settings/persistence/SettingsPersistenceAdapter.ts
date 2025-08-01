import type { PersistedSettingsData } from "@fishbowl-ai/shared";

/**
 * Platform-agnostic interface for persisting application settings.
 *
 * Implementations of this interface handle the platform-specific details
 * of storing and retrieving settings data, while maintaining a consistent
 * API across desktop and mobile platforms.
 *
 * @example
 * ```typescript
 * const adapter: SettingsPersistenceAdapter = createDesktopAdapter();
 *
 * // Save settings
 * await adapter.save(settingsData);
 *
 * // Load settings
 * const settings = await adapter.load();
 *
 * // Reset to defaults
 * await adapter.reset();
 * ```
 */
export interface SettingsPersistenceAdapter {
  /**
   * Persists the provided settings data to the platform's storage mechanism.
   *
   * @param settings - The settings data to persist
   * @throws {SettingsPersistenceError} If the save operation fails
   *
   * @example
   * ```typescript
   * try {
   *   await adapter.save({
   *     version: "1.0.0",
   *     lastUpdated: new Date().toISOString(),
   *     general: { autoMode: { enabled: true }, ... },
   *     appearance: { theme: "dark", ... },
   *     advanced: { debugLogging: false, ... }
   *   });
   * } catch (error) {
   *   if (error instanceof SettingsPersistenceError) {
   *     console.error(`Save failed: ${error.message}`);
   *   }
   * }
   * ```
   */
  save(settings: PersistedSettingsData): Promise<void>;

  /**
   * Loads the persisted settings data from the platform's storage mechanism.
   *
   * @returns The loaded settings data, or null if no settings are found
   * @throws {SettingsPersistenceError} If the load operation fails
   *
   * @example
   * ```typescript
   * try {
   *   const settings = await adapter.load();
   *   if (settings) {
   *     console.log(`Loaded settings version: ${settings.version}`);
   *   } else {
   *     console.log("No settings found, using defaults");
   *   }
   * } catch (error) {
   *   if (error instanceof SettingsPersistenceError) {
   *     console.error(`Load failed: ${error.message}`);
   *   }
   * }
   * ```
   */
  load(): Promise<PersistedSettingsData | null>;

  /**
   * Resets the persisted settings by removing them from storage.
   * After calling this method, subsequent calls to `load()` will return null
   * until new settings are saved.
   *
   * @throws {SettingsPersistenceError} If the reset operation fails
   *
   * @example
   * ```typescript
   * try {
   *   await adapter.reset();
   *   console.log("Settings reset successfully");
   * } catch (error) {
   *   if (error instanceof SettingsPersistenceError) {
   *     console.error(`Reset failed: ${error.message}`);
   *   }
   * }
   * ```
   */
  reset(): Promise<void>;
}
