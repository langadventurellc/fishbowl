import type { PersistedLlmModelsSettingsData } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * LLM models reset operation response type
 *
 * Returns the default LLM models configuration after reset
 */
export interface LlmModelsResetResponse
  extends IPCResponse<PersistedLlmModelsSettingsData> {}
