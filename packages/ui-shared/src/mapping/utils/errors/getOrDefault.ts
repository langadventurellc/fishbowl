import { MappingResult } from "./MappingResult";
import { isSuccess } from "./isSuccess";

/**
 * Gets the value from a result or returns a default
 * @param result - Result to extract value from
 * @param defaultValue - Default value to return if result is an error
 * @returns The data if successful, default value otherwise
 */
export function getOrDefault<T>(result: MappingResult<T>, defaultValue: T): T {
  return isSuccess(result) ? result.data : defaultValue;
}
