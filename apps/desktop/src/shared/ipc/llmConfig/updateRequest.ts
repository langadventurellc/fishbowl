import type { LlmConfigInput } from "@fishbowl-ai/shared";

/**
 * LLM config update operation request type
 */
export interface LlmConfigUpdateRequest {
  id: string;
  updates: Partial<LlmConfigInput>;
}
