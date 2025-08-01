import { MappingResult } from "./MappingResult";
import { createMappingError } from "./createMappingError";
import { isError } from "./isError";

/**
 * Maps over an array with error handling
 * @param mapper - Function that maps each item and may return an error
 * @param stopOnError - Whether to stop processing on first error (default: false)
 * @returns Function that maps arrays with error handling
 */
export function mapArrayWithErrors<TInput, TOutput>(
  mapper: (input: TInput, index: number) => MappingResult<TOutput>,
  stopOnError = false,
): (inputs: TInput[]) => MappingResult<TOutput[]> {
  return (inputs: TInput[]): MappingResult<TOutput[]> => {
    const results: TOutput[] = [];

    for (let i = 0; i < inputs.length; i++) {
      const result = mapper(inputs[i]!, i);

      if (isError(result)) {
        if (stopOnError) {
          return {
            success: false,
            error: createMappingError(
              `Array mapping failed at index ${i}: ${result.error.message}`,
              `index_${i}`,
              inputs[i]!,
              result.error,
            ),
          };
        }
        // Return first error when not stopping on error
        return result;
      }

      results.push(result.data);
    }

    return { success: true, data: results };
  };
}
