/**
 * Boolean validation utilities for enhanced type safety and security
 * Provides runtime type guards and validation for boolean values
 */

/**
 * Custom error class for boolean validation failures
 */
export class BooleanValidationError extends Error {
  constructor(
    message: string,
    public readonly fieldName: string,
    public readonly receivedValue: unknown,
  ) {
    super(message);
    this.name = 'BooleanValidationError';
  }
}

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

/**
 * Validates boolean values in filter objects for database operations
 * @param filterValue - Value from filter object
 * @param fieldName - Name of the field being filtered
 * @throws BooleanValidationError if value is not a valid boolean for filtering
 */
export function validateFilterBoolean(filterValue: unknown, fieldName: string): boolean {
  // Allow null for "IS NULL" queries
  if (filterValue === null) {
    return true;
  }

  return validateStrictBoolean(filterValue, fieldName);
}
