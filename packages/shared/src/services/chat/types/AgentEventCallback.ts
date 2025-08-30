/**
 * Callback function for emitting agent update events during processing
 */
export type AgentEventCallback = (event: {
  conversationAgentId: string;
  status: "thinking" | "complete" | "error";
  messageId?: string;
  error?: string;
  agentName?: string;
  errorType?:
    | "network"
    | "auth"
    | "rate_limit"
    | "validation"
    | "provider"
    | "timeout"
    | "unknown";
  retryable?: boolean;
}) => void;
