import type { LlmConfigMetadata } from "@fishbowl-ai/shared";
import type { IPCResponse } from "../base";

/**
 * LLM config list operation response type
 */
export interface LlmConfigListResponse
  extends IPCResponse<LlmConfigMetadata[]> {}
