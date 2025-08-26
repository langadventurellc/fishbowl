/**
 * Input for adding an agent to a conversation
 */
export interface AddAgentToConversationInput {
  /** ID of the conversation to add agent to */
  conversation_id: string;
  /** ID of the agent from settings to add */
  agent_id: string;
  /** Optional display order (defaults to 0) */
  display_order?: number;
}
