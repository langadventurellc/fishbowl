/**
 * Valid section identifiers for the settings modal navigation.
 *
 * These correspond to the main navigation sections available in the settings modal
 * and provide autocomplete support when setting active sections.
 *
 * @module stores/settings/settingsSection
 */
export type SettingsSection =
  | "general"
  | "llm-setup"
  | "appearance"
  | "agents"
  | "personalities"
  | "roles"
  | "advanced";
