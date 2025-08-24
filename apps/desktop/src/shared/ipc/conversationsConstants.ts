/**
 * IPC channel constants for conversations operations
 *
 * These constants define the channel names used for Inter-Process Communication
 * between the main and renderer processes for conversation management operations.
 */
export const CONVERSATION_CHANNELS = {
  CREATE: "conversations:create",
  LIST: "conversations:list",
  GET: "conversations:get",
  UPDATE: "conversations:update",
  DELETE: "conversations:delete",
} as const;

/**
 * Type representing valid conversation channel names
 */
export type ConversationsChannelType =
  (typeof CONVERSATION_CHANNELS)[keyof typeof CONVERSATION_CHANNELS];
