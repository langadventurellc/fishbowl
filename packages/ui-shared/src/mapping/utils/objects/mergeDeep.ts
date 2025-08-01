/**
 * Deep merge objects with type safety
 * @param target - Target object
 * @param sources - Source objects to merge
 * @returns Merged object
 */
export function mergeDeep<T extends object>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;

  const source = sources[0];
  const result = { ...target };

  for (const key in source) {
    const targetValue = result[key];
    const sourceValue = source[key];

    if (sourceValue === undefined) continue;

    if (
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue) &&
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue)
    ) {
      result[key] = mergeDeep(
        targetValue as T[Extract<keyof T, string>] & object,
        sourceValue as Partial<T[Extract<keyof T, string>] & object>,
      ) as T[Extract<keyof T, string>];
    } else {
      result[key] = sourceValue as T[Extract<keyof T, string>];
    }
  }

  return sources.length > 1 ? mergeDeep(result, ...sources.slice(1)) : result;
}
