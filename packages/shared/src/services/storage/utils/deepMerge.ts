/**
 * Deep merge multiple objects into a target object
 * @param target - The target object to merge into
 * @param sources - Source objects to merge from
 * @returns The merged object
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) {
    return { ...target };
  }

  const result = { ...target };

  for (const source of sources) {
    if (!source || typeof source !== "object") {
      continue;
    }

    for (const key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) {
        continue;
      }

      const sourceValue = source[key];
      const targetValue = result[key];

      // Handle null values
      if (sourceValue === null) {
        result[key] = null as T[Extract<keyof T, string>];
        continue;
      }

      // Handle undefined values (skip them)
      if (sourceValue === undefined) {
        continue;
      }

      // Deep merge objects
      if (
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        typeof targetValue === "object" &&
        targetValue !== null &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>,
        ) as T[Extract<keyof T, string>];
      } else {
        // For arrays and primitives, replace the value
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}
