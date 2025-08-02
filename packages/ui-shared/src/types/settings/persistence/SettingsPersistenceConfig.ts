/**
 * Configuration options for settings persistence adapters.
 * These options allow customization of storage behavior while maintaining
 * platform independence.
 *
 * @example
 * ```typescript
 * const config: SettingsPersistenceConfig = {
 *   encryptionKey: process.env.SETTINGS_ENCRYPTION_KEY,
 *   storageKey: "fishbowl-settings",
 *   debug: process.env.NODE_ENV === "development"
 * };
 * ```
 */
export interface SettingsPersistenceConfig {
  /**
   * Optional encryption key for securing sensitive settings.
   * If provided, the adapter implementation should encrypt the settings
   * before persisting and decrypt when loading.
   */
  encryptionKey?: string;

  /**
   * Optional custom storage key/identifier.
   * Allows multiple instances of settings to coexist by using different keys.
   * Default value is implementation-specific.
   */
  storageKey?: string;

  /**
   * Enable debug logging for persistence operations.
   * When true, adapters should log detailed information about their operations.
   */
  debug?: boolean;
}
