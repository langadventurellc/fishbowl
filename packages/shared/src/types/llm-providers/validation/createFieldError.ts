import type { LlmFieldValidationError } from "./LlmFieldValidationError";
import type { LlmValidationErrorCode } from "./LlmValidationErrorCode";
import { getDefaultErrorMessage } from "./getDefaultErrorMessage";

/**
 * Creates a field validation error with optional custom message.
 *
 * @param fieldId - The ID of the field with the error
 * @param code - The error code
 * @param message - Optional custom error message
 * @returns A field validation error
 *
 * @example
 * ```typescript
 * const error = createFieldError(
 *   "apiKey",
 *   LlmValidationErrorCode.REQUIRED_FIELD_MISSING
 * );
 * ```
 */
export const createFieldError = (
  fieldId: string,
  code: LlmValidationErrorCode,
  message?: string,
): LlmFieldValidationError => ({
  fieldId,
  code,
  message: message || getDefaultErrorMessage(code),
});
