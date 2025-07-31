// Types and schemas for settings persistence
export type {
  PersistedGeneralSettings,
  PersistedGeneralSettingsData,
  PersistedAppearanceSettings,
  PersistedAppearanceSettingsData,
} from "./types/settings";
export {
  generalSettingsSchema,
  createDefaultGeneralSettings,
  appearanceSettingsSchema,
  createDefaultAppearanceSettings,
} from "./types/settings";
