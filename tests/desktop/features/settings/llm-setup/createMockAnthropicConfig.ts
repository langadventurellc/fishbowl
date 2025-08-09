import { randomUUID } from "crypto";
import type { MockLlmConfig } from "./MockLlmConfig";

export const createMockAnthropicConfig = (
  overrides?: Partial<MockLlmConfig>,
): MockLlmConfig => {
  return {
    customName: `Test Anthropic ${randomUUID().slice(0, 8)}`,
    provider: "anthropic",
    apiKey: `sk-ant-api-test-${randomUUID()}`,
    baseUrl: "https://api.anthropic.com",
    useAuthHeader: true,
    ...overrides,
  };
};
