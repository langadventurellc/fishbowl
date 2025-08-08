/**
 * IPC channel constants for LLM configuration operations
 *
 * These constants define the channel names used for Inter-Process Communication
 * between the main and renderer processes for LLM configuration persistence operations.
 */
export const LLM_CONFIG_CHANNELS = {
  CREATE: "llm-config:create",
  READ: "llm-config:read",
  UPDATE: "llm-config:update",
  DELETE: "llm-config:delete",
  LIST: "llm-config:list",
  INITIALIZE: "llm-config:initialize",
  REFRESH_CACHE: "llm-config:refresh-cache",
} as const;

/**
 * Type representing valid LLM config channel names
 */
export type LlmConfigChannel =
  (typeof LLM_CONFIG_CHANNELS)[keyof typeof LLM_CONFIG_CHANNELS];
