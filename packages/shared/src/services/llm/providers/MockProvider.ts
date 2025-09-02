import type { LlmProvider, LlmRequestParams, LlmResponse } from "../interfaces";

/**
 * Mock LLM provider for testing and development.
 * Provides deterministic responses without external API calls.
 */
export class MockProvider implements LlmProvider {
  private readonly responses = [
    "This is a mock response from the test provider.",
    "Another predefined response for testing purposes.",
    "Mock provider: I understand your request and here's my response.",
    "Testing response with some variety in content.",
  ];

  private callCount = 0;

  async sendMessage(_params: LlmRequestParams): Promise<LlmResponse> {
    // Simulate realistic response timing (100-600ms)
    const delay = 100 + Math.random() * 500;
    await new Promise((resolve) => globalThis.setTimeout(resolve, delay));

    // Get deterministic response using call counter
    const responseIndex = this.callCount % this.responses.length;
    const content = this.responses[responseIndex]!; // Safe: modulo guarantees valid index

    // Increment call counter for next call
    this.callCount++;

    return { content };
  }
}
