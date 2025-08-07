import type { LlmConfig } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * LLM config create operation response type
 */
export interface LlmConfigCreateResponse extends IPCResponse<LlmConfig> {}
