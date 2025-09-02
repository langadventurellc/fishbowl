/**
 * Interface for structured agent error information.
 *
 * Provides comprehensive error context for UI display and error handling.
 */
export interface AgentError {
  /** User-friendly error message */
  message: string;
  /** Name of the agent that encountered the error */
  agentName?: string;
  /** Classification of error type for UI styling and behavior */
  errorType?:
    | "network"
    | "auth"
    | "rate_limit"
    | "validation"
    | "provider"
    | "timeout"
    | "unknown";
  /** Whether the error condition is retryable */
  retryable?: boolean;
}
