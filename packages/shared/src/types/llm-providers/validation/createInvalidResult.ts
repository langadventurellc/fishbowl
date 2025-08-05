import type { LlmValidationResult } from "./LlmValidationResult";
import type { LlmFieldValidationError } from "./LlmFieldValidationError";

/**
 * Creates an invalid validation result with the specified errors.
 *
 * @param errors - Array of validation errors
 * @returns An invalid validation result
 *
 * @example
 * ```typescript
 * return createInvalidResult([
 *   createFieldError("apiKey", LlmValidationErrorCode.REQUIRED_FIELD_MISSING)
 * ]);
 * ```
 */
export const createInvalidResult = (
  errors: LlmFieldValidationError[],
): LlmValidationResult => ({
  valid: false,
  errors,
});
