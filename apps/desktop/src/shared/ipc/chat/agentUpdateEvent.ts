/**
 * Event payload for agent status updates
 */
export interface AgentUpdateEvent {
  /** Unique identifier for the conversation agent */
  conversationAgentId: string;
  /** Current status of the agent */
  status: "thinking" | "complete" | "error";
  /** Message ID when agent completes successfully */
  messageId?: string;
  /** Error message when agent fails */
  error?: string;
}
