/**
 * Deep merge objects with type safety and immutability
 * @param target - Base object
 * @param sources - Objects to merge into target
 * @returns New merged object (target unchanged)
 */
export function mergeDeep<T extends Record<string, unknown>>(
  target: T,
  ...sources: Record<string, unknown>[]
): T {
  if (!sources.length) return { ...target };

  const result = { ...target };

  for (const source of sources) {
    if (!source || typeof source !== "object") continue;

    for (const [key, value] of Object.entries(source)) {
      // Security: Prevent prototype pollution
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        continue;
      }

      const targetValue = result[key as keyof T];

      if (value === null || value === undefined) {
        result[key as keyof T] = value as T[keyof T];
      } else if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value instanceof Date) &&
        typeof targetValue === "object" &&
        targetValue !== null &&
        !Array.isArray(targetValue) &&
        !(targetValue instanceof Date)
      ) {
        result[key as keyof T] = mergeDeep(
          targetValue as Record<string, unknown>,
          value as Record<string, unknown>,
        ) as T[keyof T];
      } else {
        result[key as keyof T] = value as T[keyof T];
      }
    }
  }

  return result;
}
