import type { LlmConfig } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * LLM config read operation response type
 */
export interface LlmConfigReadResponse extends IPCResponse<LlmConfig | null> {}
