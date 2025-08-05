import type { LlmValidationErrorCode } from "./LlmValidationErrorCode";
import type { LlmFieldValidationError } from "./LlmFieldValidationError";

/**
 * Custom error class for LLM configuration validation failures.
 *
 * Extends native Error with additional context about validation failures.
 * Supports both provider-level and field-level error information.
 *
 * @example
 * ```typescript
 * throw new LlmConfigurationError(
 *   "Invalid OpenAI configuration",
 *   LlmValidationErrorCode.INVALID_CONFIGURATION,
 *   [
 *     {
 *       fieldId: "apiKey",
 *       message: "API key is required",
 *       code: LlmValidationErrorCode.REQUIRED_FIELD_MISSING
 *     }
 *   ]
 * );
 * ```
 *
 * @module types/llm-providers/LlmConfigurationError
 */
export class LlmConfigurationError extends Error {
  /**
   * Create a new LLM configuration error.
   *
   * @param message - Human-readable error message
   * @param code - Error code for programmatic handling
   * @param fieldErrors - Optional array of field-level errors
   */
  constructor(
    message: string,
    public readonly code: LlmValidationErrorCode,
    public readonly fieldErrors?: LlmFieldValidationError[],
  ) {
    super(message);
    this.name = "LlmConfigurationError";

    // Ensure proper stack trace in V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get a JSON-serializable representation of this error.
   * Useful for logging and API responses.
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      fieldErrors: this.fieldErrors,
    };
  }
}
