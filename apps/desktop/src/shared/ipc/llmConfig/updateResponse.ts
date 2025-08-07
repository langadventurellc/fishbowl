import type { LlmConfig } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * LLM config update operation response type
 */
export interface LlmConfigUpdateResponse extends IPCResponse<LlmConfig> {}
