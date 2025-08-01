/**
 * Safely convert unknown values to valid enum values with fallback
 * @param value - Value to normalize (potentially invalid)
 * @param validValues - Array of valid enum values
 * @param defaultValue - Fallback value if normalization fails
 * @returns Valid enum value
 */
export function normalizeEnum<T extends string>(
  value: unknown,
  validValues: readonly T[],
  defaultValue: T,
): T {
  if (typeof value !== "string") {
    return defaultValue;
  }

  if (validValues.includes(value as T)) {
    return value as T;
  }

  return defaultValue;
}
