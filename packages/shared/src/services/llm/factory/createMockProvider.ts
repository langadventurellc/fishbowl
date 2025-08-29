import type { LlmProvider } from "../interfaces/LlmProvider";
import { MockProvider } from "../providers/MockProvider";

/**
 * Creates a mock LLM provider instance for testing and development.
 *
 * @returns A new MockProvider instance
 */
export function createMockProvider(): LlmProvider {
  return new MockProvider();
}
