import type { SettingsPersistenceAdapter } from "../types/settings/persistence/SettingsPersistenceAdapter";
import type { SettingsError } from "../utils/settings/SettingsError";

/**
 * Options for the useSettingsPersistence hook
 *
 * Defines configuration options for managing settings persistence,
 * including the storage adapter and error handling callback.
 *
 * @module types/hooks/UseSettingsPersistenceOptions
 */
export interface UseSettingsPersistenceOptions {
  /** Platform-specific adapter for persistence operations */
  adapter: SettingsPersistenceAdapter;
  /** Optional callback invoked when errors occur */
  onError?: (error: SettingsError) => void;
}
