/**
 * Ensure numeric values stay within specified bounds
 * @param value - Number to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Clamped number within bounds
 */
export function clampNumber(value: number, min: number, max: number): number {
  if (Number.isNaN(value) || Number.isNaN(min) || Number.isNaN(max)) {
    throw new Error("Invalid numeric input: NaN values not allowed");
  }

  if (min > max) {
    throw new Error("Invalid range: min must be less than or equal to max");
  }

  return Math.min(Math.max(value, min), max);
}
