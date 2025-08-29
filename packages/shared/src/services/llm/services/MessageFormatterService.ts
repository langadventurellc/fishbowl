import { Message } from "../../../types/messages/Message";
import { FormattedMessage } from "../interfaces";

/**
 * Service for formatting conversation messages for LLM provider consumption.
 * Converts internal Message[] arrays to provider-ready FormattedMessage[] arrays
 * with proper role mapping and name attribution.
 */
export class MessageFormatterService {
  /**
   * Format messages for a specific target agent.
   *
   * @param messages - Array of conversation messages to format
   * @param targetAgentId - conversation_agent_id for the agent being invoked
   * @param agentNameByConversationAgentId - Map of agent IDs to display names
   * @returns Provider-ready formatted messages with proper role mapping
   */
  formatMessages(
    messages: Message[],
    targetAgentId: string,
    agentNameByConversationAgentId: Record<string, string>,
  ): FormattedMessage[] {
    // Filter to only included messages and exclude system messages
    const includedMessages = messages.filter(
      (message) => message.included && message.role !== "system",
    );

    // Map messages with proper role assignment
    return includedMessages.map((message) => {
      // User messages become 'user' role
      if (message.role === "user") {
        return {
          role: "user",
          content: message.content,
        };
      }

      // Agent messages - check if this is the target agent
      if (message.conversation_agent_id === targetAgentId) {
        // Target agent's own messages become 'assistant'
        return {
          role: "assistant",
          content: message.content,
        };
      } else {
        // Other agents' messages become 'user' with name prefix
        const displayName = message.conversation_agent_id
          ? agentNameByConversationAgentId[message.conversation_agent_id] ||
            "Unknown Agent"
          : "Unknown Agent";

        return {
          role: "user",
          content: `${displayName}: ${message.content}`,
        };
      }
    });
  }
}
