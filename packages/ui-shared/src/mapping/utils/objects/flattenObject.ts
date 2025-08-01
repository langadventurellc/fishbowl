/**
 * Convert nested object structure to flat key-value pairs
 * @param obj - Nested object to flatten
 * @param separator - Key separator (default: '.')
 * @returns Flat object with dot-notation keys
 */
export function flattenObject<T extends Record<string, unknown>>(
  obj: T,
  separator = ".",
): Record<string, unknown> {
  return flattenObjectRecursive(obj, "", separator);
}

function flattenObjectRecursive(
  obj: Record<string, unknown>,
  prefix: string,
  separator: string,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Security: Prevent prototype pollution
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }

    const newKey = prefix ? `${prefix}${separator}${key}` : key;

    if (value === null || value === undefined) {
      result[newKey] = value;
    } else if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      Object.assign(
        result,
        flattenObjectRecursive(
          value as Record<string, unknown>,
          newKey,
          separator,
        ),
      );
    } else {
      result[newKey] = value;
    }
  }

  return result;
}
