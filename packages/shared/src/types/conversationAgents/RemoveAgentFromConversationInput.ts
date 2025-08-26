/**
 * Input for removing an agent from a conversation
 */
export interface RemoveAgentFromConversationInput {
  /** ID of the conversation to remove agent from */
  conversation_id: string;
  /** ID of the agent to remove */
  agent_id: string;
}
