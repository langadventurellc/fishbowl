import { MappingResult } from "./MappingResult";
import { MappingError } from "./MappingError";

/**
 * Type guard for error mapping results
 * @param result - Result to check
 * @returns True if result is an error
 */
export function isError<T>(
  result: MappingResult<T>,
): result is { success: false; error: MappingError } {
  return result.success === false;
}
