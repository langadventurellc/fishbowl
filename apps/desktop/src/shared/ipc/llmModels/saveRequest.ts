import type { PersistedLlmModelsSettingsData } from "@fishbowl-ai/shared";

/**
 * LLM models save operation request type
 *
 * Contains the complete LLM models data to persist
 */
export interface LlmModelsSaveRequest {
  llmModels: PersistedLlmModelsSettingsData;
}
