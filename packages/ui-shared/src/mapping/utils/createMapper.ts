/**
 * Factory for creating type-safe mappers
 * @param mapFn - Mapping function
 * @returns Typed mapper function
 */
export function createMapper<T, U>(mapFn: (input: T) => U): (input: T) => U {
  return (input: T) => mapFn(input);
}
