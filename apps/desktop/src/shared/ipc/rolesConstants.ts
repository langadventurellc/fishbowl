/**
 * IPC channel constants for roles operations
 *
 * These constants define the channel names used for Inter-Process Communication
 * between the main and renderer processes for roles persistence operations.
 */
export const ROLES_CHANNELS = {
  LOAD: "roles:load",
  SAVE: "roles:save",
  RESET: "roles:reset",
} as const;

/**
 * Type representing valid roles channel names
 */
export type RolesChannelType =
  (typeof ROLES_CHANNELS)[keyof typeof ROLES_CHANNELS];
