import type { ValidationError } from "./ValidationError";
import type { StandardizedValidationResult } from "./StandardizedValidationResult";

/**
 * Creates a validation result from data and errors
 */
export function createValidationResult<T>(
  data?: T,
  errors: ValidationError[] = [],
): StandardizedValidationResult<T> {
  return {
    success: errors.length === 0,
    data: errors.length === 0 ? data : undefined,
    errors,
  };
}
