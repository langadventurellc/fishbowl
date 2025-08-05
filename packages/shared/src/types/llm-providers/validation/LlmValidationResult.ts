import type { LlmFieldValidationError } from "./LlmFieldValidationError";

/**
 * Result of validating field values.
 *
 * Provides a simple boolean result with detailed error information
 * when validation fails.
 *
 * @example
 * ```typescript
 * const result: LlmValidationResult = {
 *   valid: false,
 *   errors: [
 *     {
 *       fieldId: "apiKey",
 *       message: "API key must be at least 20 characters",
 *       code: LlmValidationErrorCode.VALUE_TOO_SHORT
 *     }
 *   ]
 * };
 * ```
 *
 * @module types/llm-providers/LlmValidationResult
 */
export interface LlmValidationResult {
  /**
   * Whether validation passed without errors.
   * When false, errors array will contain at least one error.
   */
  valid: boolean;

  /**
   * List of field validation errors.
   * Empty array when valid is true.
   */
  errors: LlmFieldValidationError[];
}
