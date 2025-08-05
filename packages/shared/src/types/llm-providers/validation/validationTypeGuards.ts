import { LlmConfigurationError } from "./LlmConfigurationError";
import type { LlmValidationResult } from "./LlmValidationResult";
import type { LlmFieldValidationError } from "./LlmFieldValidationError";
import type { LlmProviderValidationError } from "./LlmProviderValidationError";
import type { LlmValidationErrorCode } from "./LlmValidationErrorCode";

/**
 * Type guard to check if an error is an LlmConfigurationError.
 *
 * @param error - The error to check
 * @returns True if error is an LlmConfigurationError
 *
 * @example
 * ```typescript
 * try {
 *   validateConfiguration(config);
 * } catch (error) {
 *   if (isLlmConfigurationError(error)) {
 *     console.log("Validation failed:", error.fieldErrors);
 *   }
 * }
 * ```
 *
 * @module types/llm-providers/validationTypeGuards
 */
export const isLlmConfigurationError = (
  error: unknown,
): error is LlmConfigurationError => {
  return error instanceof LlmConfigurationError;
};

/**
 * Type guard to check if a validation result has errors.
 *
 * @param result - The validation result to check
 * @returns True if validation failed with errors
 *
 * @example
 * ```typescript
 * const result = validateFields(values);
 * if (hasFieldErrors(result)) {
 *   // Handle validation errors
 *   result.errors.forEach(error => {
 *     console.log(`${error.fieldId}: ${error.message}`);
 *   });
 * }
 * ```
 */
export const hasFieldErrors = (result: LlmValidationResult): boolean => {
  return !result.valid && result.errors.length > 0;
};

/**
 * Type guard to check if an error has a specific error code.
 *
 * @param error - The error to check
 * @param code - The error code to match
 * @returns True if error has the specified code
 *
 * @example
 * ```typescript
 * if (hasErrorCode(error, LlmValidationErrorCode.REQUIRED_FIELD_MISSING)) {
 *   // Handle missing required field
 * }
 * ```
 */
export const hasErrorCode = (
  error:
    | LlmFieldValidationError
    | LlmProviderValidationError
    | LlmConfigurationError,
  code: LlmValidationErrorCode,
): boolean => {
  return error.code === code;
};
