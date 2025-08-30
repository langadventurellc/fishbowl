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
  /** Error message when agent fails (user-friendly) */
  error?: string;
  /** Agent name for error display */
  agentName?: string;
  /** Error type for UI styling/behavior */
  errorType?:
    | "network"
    | "auth"
    | "rate_limit"
    | "validation"
    | "provider"
    | "timeout"
    | "unknown";
  /** Whether error is retryable */
  retryable?: boolean;
}
