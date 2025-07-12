import { validateStrictBoolean } from './validateStrictBoolean';

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
