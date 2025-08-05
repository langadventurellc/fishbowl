import type { LlmValidationErrorCode } from "./LlmValidationErrorCode";
import type { LlmFieldValidationError } from "./LlmFieldValidationError";

/**
 * Provider-level validation error.
 *
 * Used when validation fails at the provider configuration level,
 * potentially including multiple field errors.
 *
 * @example
 * ```typescript
 * const error: LlmProviderValidationError = {
 *   providerId: "openai",
 *   message: "OpenAI configuration is invalid",
 *   code: LlmValidationErrorCode.INVALID_CONFIGURATION,
 *   fieldErrors: [
 *     {
 *       fieldId: "apiKey",
 *       message: "API key is required",
 *       code: LlmValidationErrorCode.REQUIRED_FIELD_MISSING
 *     }
 *   ]
 * };
 * ```
 *
 * @module types/llm-providers/LlmProviderValidationError
 */
export interface LlmProviderValidationError {
  /**
   * ID of the provider that failed validation.
   */
  providerId: string;

  /**
   * Overall error message describing the validation failure.
   */
  message: string;

  /**
   * Error code for the provider-level issue.
   */
  code: LlmValidationErrorCode;

  /**
   * Optional list of field-specific errors.
   * Provides detailed information about which fields failed.
   */
  fieldErrors?: LlmFieldValidationError[];
}
