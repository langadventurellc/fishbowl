import { BooleanValidationError } from './BooleanValidationError';
import { assertIsBoolean } from './assertIsBoolean';

/**
 * Validates that a value is a strict boolean (not truthy/falsy)
 * @param value - Value to validate
 * @param fieldName - Name of the field for error messages
 * @returns true if valid, throws error if invalid
 */
export function validateStrictBoolean(value: unknown, fieldName: string): boolean {
  if (value === null || value === undefined) {
    throw new BooleanValidationError(`${fieldName} cannot be null or undefined`, fieldName, value);
  }

  if (typeof value === 'string' && (value === 'true' || value === 'false')) {
    throw new BooleanValidationError(
      `${fieldName} cannot be a string representation of boolean ('true'/'false')`,
      fieldName,
      value,
    );
  }

  if (typeof value === 'number' && (value === 1 || value === 0)) {
    throw new BooleanValidationError(
      `${fieldName} cannot be a numeric representation of boolean (1/0)`,
      fieldName,
      value,
    );
  }

  assertIsBoolean(value, fieldName);
  return true;
}
