import type { FormattedMessage } from "../../llm/interfaces/FormattedMessage";

/**
 * Context data assembled for a specific agent during multi-agent conversation processing.
 * This structure matches the context parameter expected by LlmBridgeInterface.sendToProvider().
 */
export interface AgentContext {
  /** Agent-specific system prompt incorporating role, personality, and participants */
  systemPrompt: string;

  /** Conversation history formatted with proper role assignments for the target agent */
  messages: FormattedMessage[];
}
