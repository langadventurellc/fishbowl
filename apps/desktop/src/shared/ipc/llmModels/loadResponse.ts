import type { PersistedLlmModelsSettingsData } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * LLM models load operation response type
 *
 * Returns the complete LLM models configuration from persistent storage
 */
export interface LlmModelsLoadResponse
  extends IPCResponse<PersistedLlmModelsSettingsData> {}
