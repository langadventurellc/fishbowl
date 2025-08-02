import type { SettingsCategory } from "@fishbowl-ai/ui-shared";

/**
 * Settings reset operation request type
 */
export interface SettingsResetRequest {
  section?: SettingsCategory;
}
