/**
 * Enumeration of chat error types for classification and user message mapping.
 */
export enum ChatErrorType {
  NETWORK_ERROR = "network_error",
  AUTH_ERROR = "auth_error",
  RATE_LIMIT_ERROR = "rate_limit_error",
  VALIDATION_ERROR = "validation_error",
  PROVIDER_ERROR = "provider_error",
  TIMEOUT_ERROR = "timeout_error",
  UNKNOWN_ERROR = "unknown_error",
}
