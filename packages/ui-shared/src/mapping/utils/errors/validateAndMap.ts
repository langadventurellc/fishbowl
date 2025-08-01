import { MappingResult } from "./MappingResult";
import { createMappingError } from "./createMappingError";

/**
 * Combine validation with mapping
 * @param validator - Function to validate input
 * @param mapper - Function to map validated input
 * @returns Combined validation and mapping function
 */
export function validateAndMap<T, U>(
  validator: (input: unknown) => input is T,
  mapper: (input: T) => U,
): (input: unknown) => MappingResult<U> {
  return (input: unknown) => {
    if (!validator(input)) {
      return {
        success: false,
        error: createMappingError("Validation failed", undefined, input),
      };
    }

    try {
      const data = mapper(input);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: createMappingError(
          error instanceof Error ? error.message : "Mapping failed",
          undefined,
          input,
          error instanceof Error ? error : undefined,
        ),
      };
    }
  };
}
