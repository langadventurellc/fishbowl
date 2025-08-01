/**
 * Convert various truthy/falsy values to boolean
 * @param value - Value to coerce
 * @returns Boolean representation
 */
export function coerceBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.toLowerCase().trim();
    return ["true", "yes", "1", "on"].includes(normalized);
  }
  if (typeof value === "number") return value !== 0;
  return Boolean(value);
}
