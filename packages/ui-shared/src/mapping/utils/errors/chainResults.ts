import { MappingResult } from "./MappingResult";
import { isError } from "./isError";

/**
 * Chains multiple result-returning operations
 * @param first - First operation that returns a result
 * @param second - Second operation that takes the first's success value and returns a result
 * @returns Function that chains the operations, stopping on first error
 */
export function chainResults<TInput, TIntermediate, TOutput>(
  first: (input: TInput) => MappingResult<TIntermediate>,
  second: (input: TIntermediate) => MappingResult<TOutput>,
): (input: TInput) => MappingResult<TOutput> {
  return (input: TInput): MappingResult<TOutput> => {
    const firstResult = first(input);
    if (isError(firstResult)) {
      return firstResult;
    }
    return second(firstResult.data);
  };
}
