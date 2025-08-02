import type { SettingsFormData } from "../types/settings/combined/SettingsFormData";
import type { SettingsError } from "../utils/settings/SettingsError";

/**
 * Return type for the useSettingsPersistence hook
 *
 * Defines the interface returned by useSettingsPersistence, providing
 * atomic settings operations with loading states and error handling.
 *
 * @module types/hooks/UseSettingsPersistenceReturn
 */
export interface UseSettingsPersistenceReturn {
  /** Current settings data, null if not loaded yet */
  settings: SettingsFormData | null;
  /** Whether an async operation is in progress */
  isLoading: boolean;
  /** Last error that occurred, null if no error */
  error: SettingsError | null;
  /** Save settings to storage atomically */
  saveSettings: (settings: SettingsFormData) => Promise<void>;
  /** Load settings from storage */
  loadSettings: () => Promise<void>;
  /** Reset settings to defaults */
  resetSettings: () => Promise<void>;
}
