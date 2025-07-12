import { BooleanValidationError } from './BooleanValidationError';
import { validateStrictBoolean } from './validateStrictBoolean';

/**
 * Safe boolean validator that returns a result object instead of throwing
 * @param value - Value to validate
 * @param fieldName - Name of the field for error messages
 * @returns Validation result with success flag and error details
 */
export function safeValidateBoolean(
  value: unknown,
  fieldName: string,
): {
  valid: boolean;
  value?: boolean;
  error?: string;
} {
  try {
    validateStrictBoolean(value, fieldName);
    return { valid: true, value: value as boolean };
  } catch (error) {
    if (error instanceof BooleanValidationError) {
      return { valid: false, error: error.message };
    }
    return { valid: false, error: `Unexpected validation error for ${fieldName}` };
  }
}
