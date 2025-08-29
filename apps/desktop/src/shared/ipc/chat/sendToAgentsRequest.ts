/**
 * Request payload for sending messages to agents
 */
export interface SendToAgentsRequest {
  /** Unique identifier for the conversation */
  conversationId: string;
  /** Unique identifier for the user message triggering agent responses */
  userMessageId: string;
}
