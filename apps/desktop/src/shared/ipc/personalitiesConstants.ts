/**
 * IPC channel constants for personalities operations
 *
 * These constants define the channel names used for Inter-Process Communication
 * between the main and renderer processes for personalities persistence operations.
 */
export const PERSONALITIES_CHANNELS = {
  LOAD: "personalities:load",
  SAVE: "personalities:save",
  RESET: "personalities:reset",
} as const;

/**
 * Type representing valid personalities channel names
 */
export type PersonalitiesChannelType =
  (typeof PERSONALITIES_CHANNELS)[keyof typeof PERSONALITIES_CHANNELS];
