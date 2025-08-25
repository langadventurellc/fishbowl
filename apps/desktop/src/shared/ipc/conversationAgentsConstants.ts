/**
 * IPC channel constants for conversation agents operations
 *
 * These constants define the channel names used for Inter-Process Communication
 * between the main and renderer processes for conversation agent management operations.
 */
export const CONVERSATION_AGENT_CHANNELS = {
  GET_BY_CONVERSATION: "conversationAgent:getByConversation",
  ADD: "conversationAgent:add",
  REMOVE: "conversationAgent:remove",
  LIST: "conversationAgent:list", // For debugging
} as const;

/**
 * Type representing valid conversation agent channel names
 */
export type ConversationAgentChannelType =
  (typeof CONVERSATION_AGENT_CHANNELS)[keyof typeof CONVERSATION_AGENT_CHANNELS];
