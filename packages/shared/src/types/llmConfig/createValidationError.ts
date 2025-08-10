import type { ValidationError } from "./ValidationError";
import type { ValidationErrorCode } from "./ValidationErrorCode";
import { sanitizeValue } from "../../validation/sanitizeValue";

/**
 * Creates a validation error for custom business rules
 */
export function createValidationError(
  field: string,
  code: ValidationErrorCode,
  message: string,
  value?: unknown,
): ValidationError {
  return {
    field,
    code,
    message,
    value: sanitizeValue(field, value),
  };
}
