import { ChatErrorType } from "./ChatErrorType";

/**
 * Structured error information for multi-agent chat operations.
 * Provides comprehensive error context with user-safe messaging.
 */
export interface ChatError {
  /** Classification of the error type for handling and display */
  type: ChatErrorType;

  /** Generic error code for programmatic handling */
  code: string;

  /** User-friendly error message safe for display */
  userMessage: string;

  /** Technical details for logging and debugging */
  technicalDetails: string;

  /** Conversation where the error occurred */
  conversationId: string;

  /** Agent ID that encountered the error */
  agentId: string;

  /** LLM provider that generated the error */
  provider: string;

  /** When the error occurred */
  timestamp: Date;

  /** Whether this error type is safe to retry */
  retryable: boolean;
}
