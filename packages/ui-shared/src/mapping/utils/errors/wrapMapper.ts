import { MappingError } from "./MappingError";
import { MappingResult } from "./MappingResult";
import { createMappingError } from "./createMappingError";

/**
 * Add error boundary to mapping functions
 * @param mapper - Mapping function to wrap
 * @returns Wrapped mapper that returns MappingResult
 */
export function wrapMapper<T, U>(
  mapper: (input: T) => U,
): (input: T) => MappingResult<U> {
  return (input: T) => {
    try {
      const data = mapper(input);
      return { success: true, data };
    } catch (error) {
      const mappingError =
        error instanceof MappingError
          ? error
          : createMappingError(
              error instanceof Error ? error.message : "Unknown mapping error",
              undefined,
              input,
              error instanceof Error ? error : undefined,
            );
      return { success: false, error: mappingError };
    }
  };
}
