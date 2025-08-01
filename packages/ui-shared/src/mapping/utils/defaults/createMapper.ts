import { MappingResult } from "../errors/MappingResult";
import { MappingError } from "../errors/MappingError";

/**
 * Factory for creating type-safe mappers with optional validation
 * @param mapperFn - Core mapping function
 * @param validator - Optional input validation function
 * @returns Type-safe mapper with error handling
 */
export function createMapper<T, U>(
  mapperFn: (input: T) => U,
  validator?: (input: T) => boolean,
): (input: T) => MappingResult<U> {
  return (input: T): MappingResult<U> => {
    try {
      // Validate input if validator provided
      if (validator && !validator(input)) {
        return {
          success: false,
          error: new MappingError("Input validation failed"),
        };
      }

      // Perform mapping
      const result = mapperFn(input);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: new MappingError(
          error instanceof Error ? error.message : "Mapping failed",
          undefined,
          undefined,
          error instanceof Error ? error : undefined,
        ),
      };
    }
  };
}
