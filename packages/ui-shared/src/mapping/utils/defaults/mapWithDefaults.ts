import { applyDefaults } from "./applyDefaults";

/**
 * Create a mapper that applies defaults before transformation
 * @param mapper - Transformation function
 * @param defaults - Default values for output type
 * @returns Mapper function that handles partial inputs
 */
export function mapWithDefaults<T, U extends Record<string, unknown>>(
  mapper: (input: T) => U,
  defaults: U,
): (input: Partial<T>) => U {
  return (input: Partial<T>): U => {
    // First apply any available defaults to the input if T extends Record
    const processedInput = input as T;
    const result = mapper(processedInput);

    // Apply defaults to the output
    return applyDefaults(
      result as Partial<Record<string, unknown>> & Partial<U>,
      defaults,
    );
  };
}
