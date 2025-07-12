import { BooleanValidationError } from './BooleanValidationError';

/**
 * Runtime type guard for boolean values with strict validation
 * @param value - Value to validate
 * @param fieldName - Name of the field for error messages
 * @throws BooleanValidationError if value is not a strict boolean
 */
export function assertIsBoolean(value: unknown, fieldName: string): asserts value is boolean {
  if (typeof value !== 'boolean') {
    throw new BooleanValidationError(
      `${fieldName} must be a boolean value (true or false), received: ${typeof value}`,
      fieldName,
      value,
    );
  }
}
