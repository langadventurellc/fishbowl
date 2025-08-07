import type { LlmConfigInput } from "@fishbowl-ai/shared";

/**
 * LLM config create operation request type
 */
export interface LlmConfigCreateRequest {
  config: LlmConfigInput;
}
