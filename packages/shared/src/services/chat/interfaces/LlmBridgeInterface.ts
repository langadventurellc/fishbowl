import type { FormattedMessage } from "../../llm/interfaces";

/**
 * Platform-agnostic LLM provider bridge interface for chat orchestration.
 * Provides a clean abstraction layer between shared business logic and
 * platform-specific LLM provider implementations (OpenAI, Anthropic).
 *
 * All methods are asynchronous and return Promises for consistency.
 * Platform-specific implementations handle the actual provider API calls
 * while maintaining this common interface contract.
 *
 * @example
 * ```typescript
 * // Send message to agent's configured provider
 * const agentResponse = await bridge.sendToProvider(
 *   { llmConfigId: "openai-gpt4" },
 *   {
 *     systemPrompt: "You are a helpful assistant.",
 *     messages: [{ role: "user", content: "Hello!" }]
 *   }
 * );
 * ```
 */
export interface LlmBridgeInterface {
  /**
   * Send message to LLM provider for specific agent.
   * Handles provider resolution, authentication, and API communication
   * while abstracting away provider-specific implementation details.
   *
   * @param agentConfig - Agent configuration containing LLM provider reference
   * @param agentConfig.llmConfigId - ID used to resolve LLM provider configuration
   * @param context - Formatted context for the LLM request
   * @param context.systemPrompt - System prompt defining agent behavior and role
   * @param context.messages - Conversation history formatted for LLM consumption
   * @returns Promise resolving to agent response content string
   *
   * @throws {Error} When provider resolution fails or API call encounters errors
   *
   * @example
   * ```typescript
   * const response = await bridge.sendToProvider(
   *   { llmConfigId: "anthropic-claude-3-5-sonnet" },
   *   {
   *     systemPrompt: "You are a creative writing assistant.",
   *     messages: [
   *       { role: "user", content: "Write a short poem about technology" },
   *       { role: "assistant", content: "Previous response..." },
   *       { role: "user", content: "Make it more optimistic" }
   *     ]
   *   }
   * );
   * ```
   */
  sendToProvider(
    agentConfig: { llmConfigId: string },
    context: { systemPrompt: string; messages: FormattedMessage[] },
  ): Promise<string>;
}
