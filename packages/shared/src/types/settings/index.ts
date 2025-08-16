// Individual category exports
export { advancedSettingsSchema } from "./advancedSettingsSchema";
export { appearanceSettingsSchema } from "./appearanceSettingsSchema";
export { generalSettingsSchema } from "./generalSettingsSchema";
export {
  persistedRoleSchema,
  persistedRolesSettingsSchema,
  ROLES_SCHEMA_VERSION,
  CURRENT_ROLES_SCHEMA_VERSION,
} from "./rolesSettingsSchema";
export {
  persistedPersonalitySchema,
  persistedPersonalitiesSettingsSchema,
  PERSONALITIES_SCHEMA_VERSION,
  CURRENT_PERSONALITIES_SCHEMA_VERSION,
} from "./personalitiesSettingsSchema";
export { createDefaultAdvancedSettings } from "./createDefaultAdvancedSettings";
export { createDefaultAppearanceSettings } from "./createDefaultAppearanceSettings";
export { createDefaultGeneralSettings } from "./createDefaultGeneralSettings";
export { createDefaultRolesSettings } from "./createDefaultRolesSettings";
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
export type { PersistedRole } from "./PersistedRole";
export type { PersistedRoleData } from "./PersistedRoleData";
export type { PersistedRolesSettingsData } from "./PersistedRolesSettingsData";
export type { PersistedPersonalityData } from "./PersistedPersonalityData";
export type { PersistedPersonalitiesSettingsData } from "./PersistedPersonalitiesSettingsData";
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
