// Individual category exports
export { advancedSettingsSchema } from "./advancedSettingsSchema";
export { appearanceSettingsSchema } from "./appearanceSettingsSchema";
export { generalSettingsSchema } from "./generalSettingsSchema";
export { createDefaultAdvancedSettings } from "./createDefaultAdvancedSettings";
export { createDefaultAppearanceSettings } from "./createDefaultAppearanceSettings";
export { createDefaultGeneralSettings } from "./createDefaultGeneralSettings";
export type { ConversationMode } from "./ConversationMode";
export { CONVERSATION_MODE_OPTIONS } from "./ConversationMode";
export type { MessageSpacing } from "./MessageSpacing";
export { MESSAGE_SPACING_OPTIONS } from "./MessageSpacing";
export type { PersistedAdvancedSettings } from "./PersistedAdvancedSettings";
export type { PersistedAdvancedSettingsData } from "./PersistedAdvancedSettingsData";
export type { PersistedAppearanceSettings } from "./PersistedAppearanceSettings";
export type { PersistedAppearanceSettingsData } from "./PersistedAppearanceSettingsData";
export type { PersistedGeneralSettings } from "./PersistedGeneralSettings";
export type { PersistedGeneralSettingsData } from "./PersistedGeneralSettingsData";
export type { ShowTimestamps } from "./ShowTimestamps";
export { SHOW_TIMESTAMPS_OPTIONS } from "./ShowTimestamps";
export type { ThemeMode } from "./ThemeMode";
export { THEME_MODES } from "./ThemeMode";

// Master settings exports
export { createDefaultPersistedSettings } from "./createDefaultPersistedSettings";
export type { PersistedSettingsData } from "./PersistedSettingsData";
export type { PersistedSettingsUpdate } from "./PersistedSettingsUpdate";
export {
  CURRENT_SCHEMA_VERSION,
  persistedSettingsSchema,
} from "./persistedSettingsSchema";
