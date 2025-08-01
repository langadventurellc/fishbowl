import { MappingResult } from "./MappingResult";

/**
 * Type guard for successful mapping results
 * @param result - Result to check
 * @returns True if result is successful
 */
export function isSuccess<T>(
  result: MappingResult<T>,
): result is { success: true; data: T } {
  return result.success === true;
}
