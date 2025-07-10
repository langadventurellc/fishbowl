/**
 * Validates store update data to ensure consistency and prevent corruption
 * Returns true if data is valid, false otherwise
 */
export function validateStoreUpdate<T>(
  data: T,
  validator: (data: T) => boolean,
  errorHandler?: (error: string) => void,
): data is T {
  try {
    const isValid = validator(data);
    if (!isValid && errorHandler) {
      errorHandler('Store update validation failed: Invalid data structure');
    }
    return isValid;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Validation error';
    if (errorHandler) {
      errorHandler(`Store update validation error: ${errorMessage}`);
    }
    return false;
  }
}
