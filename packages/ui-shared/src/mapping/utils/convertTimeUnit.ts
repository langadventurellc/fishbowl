type TimeUnit = "ms" | "s";

/**
 * Convert time values between milliseconds and seconds
 * @param value - Time value to convert
 * @param from - Source unit
 * @param to - Target unit
 * @returns Converted time value
 */
export function convertTimeUnit(
  value: number,
  from: TimeUnit,
  to: TimeUnit,
): number {
  if (from === to) return value;

  if (from === "ms" && to === "s") {
    return value / 1000;
  } else if (from === "s" && to === "ms") {
    return value * 1000;
  }

  return value;
}
