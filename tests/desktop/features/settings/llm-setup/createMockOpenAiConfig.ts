import { randomUUID } from "crypto";
import type { MockLlmConfig } from "./MockLlmConfig";

export const createMockOpenAiConfig = (
  overrides?: Partial<MockLlmConfig>,
): MockLlmConfig => {
  return {
    customName: `Test OpenAI ${randomUUID().slice(0, 8)}`,
    provider: "openai",
    apiKey: `sk-test-${randomUUID()}`,
    useAuthHeader: false,
    ...overrides,
  };
};
