/**
 * IPC channel constants for chat operations
 *
 * These constants define the channel names used for Inter-Process Communication
 * between the main and renderer processes for multi-agent chat operations.
 */
export const CHAT_CHANNELS = {
  SEND_TO_AGENTS: "chat:sendToAgents",
} as const;
