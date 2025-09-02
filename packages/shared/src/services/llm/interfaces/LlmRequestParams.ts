import type { LlmConfig } from "../../../types/llmConfig";
import type { FormattedMessage } from "./FormattedMessage";

export interface LlmRequestParams {
  systemPrompt: string;
  model: string;
  messages: FormattedMessage[];
  config: LlmConfig;
  sampling: {
    temperature: number;
    topP: number;
    maxTokens: number;
  };
  stream?: false | undefined;
}
