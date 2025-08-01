/**
 * Safely convert unknown values to valid enum values
 * @param value - Value to normalize
 * @param validValues - Array of valid enum values
 * @param defaultValue - Default value if normalization fails
 * @returns Valid enum value
 */
export function normalizeEnum<T extends string>(
  value: unknown,
  validValues: readonly T[],
  defaultValue: T,
): T {
  if (typeof value === "string" && validValues.includes(value as T)) {
    return value as T;
  }
  return defaultValue;
}
