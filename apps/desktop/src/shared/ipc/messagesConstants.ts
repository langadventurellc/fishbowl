/**
 * IPC channel constants for messages operations
 *
 * These constants define the channel names used for Inter-Process Communication
 * between the main and renderer processes for message management operations.
 */
export const MESSAGES_CHANNELS = {
  LIST: "messages:list",
  CREATE: "messages:create",
  UPDATE_INCLUSION: "messages:updateInclusion",
} as const;

/**
 * Type representing valid message channel names
 */
export type MessagesChannelType =
  (typeof MESSAGES_CHANNELS)[keyof typeof MESSAGES_CHANNELS];
