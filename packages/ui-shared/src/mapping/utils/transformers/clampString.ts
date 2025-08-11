/**
 * Clamp string length to specified bounds, with trimming applied first.
 *
 * @param value - String to clamp
 * @param min - Minimum length (after trimming)
 * @param max - Maximum length (after trimming)
 * @returns Trimmed and length-clamped string
 *
 * @throws Error if min > max or if inputs are invalid
 *
 * @example
 * ```typescript
 * clampString("  hello world  ", 5, 10);
 * // Returns: "hello worl" (trimmed then clamped to max 10)
 *
 * clampString("hi", 5, 10);
 * // Returns: "hi   " (padded to minimum length 5)
 * ```
 */
export function clampString(value: string, min: number, max: number): string {
  if (typeof value !== "string") {
    throw new Error("Value must be a string");
  }

  if (typeof min !== "number" || typeof max !== "number") {
    throw new Error("Min and max must be numbers");
  }

  if (Number.isNaN(min) || Number.isNaN(max)) {
    throw new Error("Min and max cannot be NaN");
  }

  if (min < 0 || max < 0) {
    throw new Error("Min and max must be non-negative");
  }

  if (min > max) {
    throw new Error("Invalid range: min must be less than or equal to max");
  }

  const trimmed = value.trim();

  if (trimmed.length < min) {
    return trimmed.padEnd(min, " ");
  }

  if (trimmed.length > max) {
    return trimmed.substring(0, max);
  }

  return trimmed;
}
