import type { GeneralSettingsFormData } from "../generalSettings";
import type { AppearanceSettingsFormData } from "../appearanceSettings";
import type { AdvancedSettingsFormData } from "../advancedSettings";

/**
 * Combined settings form data for UI components
 * Represents all settings categories as a unified structure for atomic operations
 */
export interface SettingsFormData {
  /** General application settings including auto mode, conversation defaults, and update preferences */
  general: GeneralSettingsFormData;

  /** Visual customization preferences including theme, display options, and chat formatting */
  appearance: AppearanceSettingsFormData;

  /** Developer and experimental settings for debugging and advanced features */
  advanced: AdvancedSettingsFormData;
}
