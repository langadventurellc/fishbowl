import type { LlmRequestParams } from "./LlmRequestParams";
import type { LlmResponse } from "./LlmResponse";

export interface LlmProvider {
  sendMessage(params: LlmRequestParams): Promise<LlmResponse>;
}
