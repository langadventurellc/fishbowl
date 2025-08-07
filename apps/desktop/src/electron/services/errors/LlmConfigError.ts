/**
 * Base error class for all LLM configuration service operations.
 * Provides consistent error structure with contextual information
 * that can be safely serialized for IPC communication.
 */
export class LlmConfigError extends Error {
  /**
   * Create a new LLM configuration error.
   * @param message Human-readable error message (sanitized for user display)
   * @param code Error code for categorization (e.g., 'CONFIG_NOT_FOUND')
   * @param context Optional contextual information (non-sensitive data only)
   * @param cause Optional underlying error that caused this error
   */
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;

    // Ensure proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get a JSON-serializable representation of this error.
   * Used for IPC communication between main and renderer processes.
   * Excludes stack trace in production and sensitive information.
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      cause: this.cause?.message,
    };
  }
}
