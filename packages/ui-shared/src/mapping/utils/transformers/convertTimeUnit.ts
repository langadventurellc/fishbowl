import type { TimeUnit } from "./TimeUnit";

/**
 * Convert time values between milliseconds and seconds
 * @param value - Time value to convert
 * @param from - Source time unit
 * @param to - Target time unit
 * @returns Converted time value
 */
export function convertTimeUnit(
  value: number,
  from: TimeUnit,
  to: TimeUnit,
): number {
  if (from === to) {
    return value;
  }

  if (from === "ms" && to === "s") {
    return value / 1000;
  }

  if (from === "s" && to === "ms") {
    return value * 1000;
  }

  // This should never be reached due to TypeScript exhaustiveness checking
  throw new Error(`Unexpected time unit: ${from}`);
}
