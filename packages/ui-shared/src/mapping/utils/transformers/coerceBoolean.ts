/**
 * Convert various truthy/falsy values to strict boolean
 * @param value - Value to coerce to boolean
 * @returns Strict boolean value
 */
export function coerceBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.toLowerCase().trim();
    if (normalized === "true" || normalized === "1" || normalized === "yes") {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no") {
      return false;
    }
  }

  if (typeof value === "number") {
    return value !== 0 && !Number.isNaN(value);
  }

  return Boolean(value);
}
