import { LlmProviderError } from "../../llm/errors/LlmProviderError";
import { ChatError } from "./ChatError";
import { ChatErrorType } from "./ChatErrorType";

/**
 * Maps LlmProviderError instances to structured ChatError format.
 * Provides error classification and user-friendly message generation.
 */
export class ErrorMapper {
  /**
   * Convert an LlmProviderError to a structured ChatError.
   * @param error - The LlmProviderError to convert
   * @param conversationId - Conversation where error occurred
   * @param agentId - Agent that encountered the error
   * @returns Structured ChatError with user-safe messaging
   */
  static fromLlmProviderError(
    error: LlmProviderError,
    conversationId: string,
    agentId: string,
  ): ChatError {
    const errorType = this.classifyError(error);
    const provider = error.provider || "unknown";

    return {
      type: errorType,
      code: this.generateErrorCode(errorType),
      userMessage: this.generateUserMessage(errorType, agentId),
      technicalDetails: error.message,
      conversationId,
      agentId,
      provider,
      timestamp: new Date(),
      retryable: this.isRetryable(errorType),
    };
  }

  /**
   * Convert a generic Error to a structured ChatError.
   * @param error - The generic Error to convert
   * @param conversationId - Conversation where error occurred
   * @param agentId - Agent that encountered the error
   * @param provider - Optional provider name
   * @returns Structured ChatError with user-safe messaging
   */
  static fromGenericError(
    error: Error,
    conversationId: string,
    agentId: string,
    provider = "unknown",
  ): ChatError {
    const errorType = this.classifyGenericError(error);

    return {
      type: errorType,
      code: this.generateErrorCode(errorType),
      userMessage: this.generateUserMessage(errorType, agentId),
      technicalDetails: error.message,
      conversationId,
      agentId,
      provider,
      timestamp: new Date(),
      retryable: this.isRetryable(errorType),
    };
  }

  /**
   * Classify an LlmProviderError into a ChatErrorType.
   */
  private static classifyError(error: LlmProviderError): ChatErrorType {
    const message = error.message.toLowerCase();

    // Network-related errors
    if (
      message.includes("network") ||
      message.includes("connection refused") ||
      message.includes("connection failed") ||
      message.includes("cannot connect") ||
      message.includes("unable to connect") ||
      message.includes("econnrefused") ||
      message.includes("enotfound")
    ) {
      return ChatErrorType.NETWORK_ERROR;
    }

    // Authentication errors
    if (
      message.includes("unauthorized") ||
      message.includes("authentication") ||
      message.includes("auth") ||
      message.includes("401") ||
      message.includes("api key") ||
      message.includes("invalid key")
    ) {
      return ChatErrorType.AUTH_ERROR;
    }

    // Rate limit errors
    if (
      message.includes("rate limit") ||
      message.includes("too many requests") ||
      message.includes("429") ||
      message.includes("quota") ||
      message.includes("throttle")
    ) {
      return ChatErrorType.RATE_LIMIT_ERROR;
    }

    // Validation errors
    if (
      message.includes("invalid") ||
      message.includes("validation") ||
      message.includes("bad request") ||
      message.includes("400") ||
      message.includes("malformed")
    ) {
      return ChatErrorType.VALIDATION_ERROR;
    }

    // Provider-specific errors (5xx status codes) - check before timeout to catch "504 gateway timeout"
    if (
      message.includes("500") ||
      message.includes("502") ||
      message.includes("503") ||
      message.includes("504") ||
      message.includes("internal server error") ||
      message.includes("service unavailable")
    ) {
      return ChatErrorType.PROVIDER_ERROR;
    }

    // Timeout errors
    if (
      message.includes("timeout") ||
      message.includes("timed out") ||
      message.includes("etimedout") ||
      message.includes("request took too long")
    ) {
      return ChatErrorType.TIMEOUT_ERROR;
    }

    // Default to unknown error
    return ChatErrorType.UNKNOWN_ERROR;
  }

  /**
   * Classify a generic Error into a ChatErrorType.
   */
  private static classifyGenericError(error: Error): ChatErrorType {
    const message = error.message.toLowerCase();

    // Basic classification for generic errors
    if (message.includes("timeout")) {
      return ChatErrorType.TIMEOUT_ERROR;
    }

    if (message.includes("network") || message.includes("connection")) {
      return ChatErrorType.NETWORK_ERROR;
    }

    if (message.includes("validation") || message.includes("invalid")) {
      return ChatErrorType.VALIDATION_ERROR;
    }

    return ChatErrorType.UNKNOWN_ERROR;
  }

  /**
   * Generate a user-friendly error message based on error type.
   */
  private static generateUserMessage(
    errorType: ChatErrorType,
    agentId: string,
  ): string {
    const agentPrefix = `Agent ${agentId}: `;

    switch (errorType) {
      case ChatErrorType.NETWORK_ERROR:
        return `${agentPrefix}Unable to connect to AI service. Please check your connection and try again.`;

      case ChatErrorType.AUTH_ERROR:
        return `${agentPrefix}Authentication failed. Please check your API configuration.`;

      case ChatErrorType.RATE_LIMIT_ERROR:
        return `${agentPrefix}Too many requests. Please wait a moment before trying again.`;

      case ChatErrorType.VALIDATION_ERROR:
        return `${agentPrefix}Invalid request format. Please try again.`;

      case ChatErrorType.PROVIDER_ERROR:
        return `${agentPrefix}AI service temporarily unavailable. Please try again.`;

      case ChatErrorType.TIMEOUT_ERROR:
        return `${agentPrefix}Request timed out. Please try again.`;

      case ChatErrorType.UNKNOWN_ERROR:
      default:
        return `${agentPrefix}An unexpected error occurred. Please try again.`;
    }
  }

  /**
   * Generate a generic error code for the error type.
   */
  private static generateErrorCode(errorType: ChatErrorType): string {
    switch (errorType) {
      case ChatErrorType.NETWORK_ERROR:
        return "CHAT_NETWORK_001";
      case ChatErrorType.AUTH_ERROR:
        return "CHAT_AUTH_001";
      case ChatErrorType.RATE_LIMIT_ERROR:
        return "CHAT_RATE_LIMIT_001";
      case ChatErrorType.VALIDATION_ERROR:
        return "CHAT_VALIDATION_001";
      case ChatErrorType.PROVIDER_ERROR:
        return "CHAT_PROVIDER_001";
      case ChatErrorType.TIMEOUT_ERROR:
        return "CHAT_TIMEOUT_001";
      case ChatErrorType.UNKNOWN_ERROR:
      default:
        return "CHAT_UNKNOWN_001";
    }
  }

  /**
   * Determine if an error type is safe to retry.
   */
  private static isRetryable(errorType: ChatErrorType): boolean {
    switch (errorType) {
      case ChatErrorType.NETWORK_ERROR:
      case ChatErrorType.PROVIDER_ERROR:
      case ChatErrorType.TIMEOUT_ERROR:
      case ChatErrorType.RATE_LIMIT_ERROR:
        return true;

      case ChatErrorType.AUTH_ERROR:
      case ChatErrorType.VALIDATION_ERROR:
      case ChatErrorType.UNKNOWN_ERROR:
      default:
        return false;
    }
  }
}
