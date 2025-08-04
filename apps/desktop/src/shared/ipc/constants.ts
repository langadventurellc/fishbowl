/**
 * IPC channel constants for settings operations
 *
 * These constants define the channel names used for Inter-Process Communication
 * between the main and renderer processes for settings persistence operations.
 */
export const SETTINGS_CHANNELS = {
  LOAD: "settings:load",
  SAVE: "settings:save",
  RESET: "settings:reset",
  SET_DEBUG_LOGGING: "settings:setDebugLogging",
} as const;

/**
 * Type representing valid settings channel names
 */
export type SettingsChannel =
  (typeof SETTINGS_CHANNELS)[keyof typeof SETTINGS_CHANNELS];
