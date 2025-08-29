/**
 * Event types for chat operations (main → renderer)
 *
 * These constants define the event names used for real-time updates
 * from main process to renderer during multi-agent chat processing.
 */
export const CHAT_EVENTS = {
  AGENT_UPDATE: "agent:update",
  ALL_COMPLETE: "all:complete",
} as const;
