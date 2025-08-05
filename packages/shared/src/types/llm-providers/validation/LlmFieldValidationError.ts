import type { LlmValidationErrorCode } from "./LlmValidationErrorCode";

/**
 * Represents a validation error for a specific field.
 *
 * Contains all information needed to display field-level errors in the UI
 * and handle them programmatically.
 *
 * @example
 * ```typescript
 * const error: LlmFieldValidationError = {
 *   fieldId: "apiKey",
 *   message: "API key is required",
 *   code: LlmValidationErrorCode.REQUIRED_FIELD_MISSING
 * };
 * ```
 *
 * @module types/llm-providers/LlmFieldValidationError
 */
export interface LlmFieldValidationError {
  /**
   * ID of the field that failed validation.
   * Matches the field's id property in LlmFieldConfig.
   */
  fieldId: string;

  /**
   * Human-readable error message for display in UI.
   * Should be clear and actionable for end users.
   */
  message: string;

  /**
   * Error code for programmatic handling.
   * Enables consistent error handling across platforms.
   */
  code: LlmValidationErrorCode;

  /**
   * The invalid value that caused the error.
   * Optional to avoid exposing sensitive data in logs.
   * Should be omitted for secure fields.
   */
  value?: unknown;
}
