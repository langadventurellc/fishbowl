import type { PersistedSettingsData } from "@fishbowl-ai/shared";
import type { SettingsCategory } from "@fishbowl-ai/ui-shared";

/**
 * Settings save operation request type
 */
export interface SettingsSaveRequest {
  settings: Partial<PersistedSettingsData>;
  section?: SettingsCategory;
}
