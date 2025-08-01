import { MappingResult } from "./MappingResult";
import { isSuccess } from "./isSuccess";

/**
 * Unwraps a result or throws the error
 * @param result - Result to unwrap
 * @returns The data if successful
 * @throws MappingError if result is an error
 */
export function unwrapResult<T>(result: MappingResult<T>): T {
  if (isSuccess(result)) {
    return result.data;
  }
  throw result.error;
}
