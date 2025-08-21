/**
 * IPC channel constants for LLM models operations
 *
 * These constants define the channel names used for Inter-Process Communication
 * between the main and renderer processes for LLM models persistence operations.
 */
export const LLM_MODELS_CHANNELS = {
  LOAD: "llm-models:load",
} as const;

/**
 * Type representing valid LLM models channel names
 */
export type LlmModelsChannelType =
  (typeof LLM_MODELS_CHANNELS)[keyof typeof LLM_MODELS_CHANNELS];
