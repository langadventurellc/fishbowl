import { MappingError } from "./MappingError";

/**
 * Standardized error creation for mapping operations
 * @param message - Error message
 * @param field - Field that caused the error
 * @param value - Value that caused the error
 * @param cause - Original error if any
 * @returns MappingError instance
 */
export function createMappingError(
  message: string,
  field?: string,
  value?: unknown,
  cause?: Error,
): MappingError {
  return new MappingError(message, field, value, cause);
}
