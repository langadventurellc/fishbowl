/**
 * IPC channel constants for agents operations
 *
 * These constants define the channel names used for Inter-Process Communication
 * between the main and renderer processes for agents persistence operations.
 */
export const AGENTS_CHANNELS = {
  LOAD: "agents:load",
  SAVE: "agents:save",
  RESET: "agents:reset",
} as const;

/**
 * Type representing valid agents channel names
 */
export type AgentsChannelType =
  (typeof AGENTS_CHANNELS)[keyof typeof AGENTS_CHANNELS];
