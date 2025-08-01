import { applyDefaults } from "./applyDefaults";

/**
 * Create a mapper function that applies defaults before mapping
 * @param mapper - Function to transform input to output
 * @param defaults - Default values for the output type
 * @returns Mapper function that handles partial inputs
 */
export function mapWithDefaults<T extends object, U extends object>(
  mapper: (input: T) => U,
  defaults: U,
): (input: Partial<T>) => U {
  return (input: Partial<T>) => {
    const withDefaults = applyDefaults(input, {} as T);
    const mapped = mapper(withDefaults);
    return applyDefaults(mapped, defaults);
  };
}
