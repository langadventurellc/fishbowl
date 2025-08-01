/**
 * Reconstruct nested object from flat key-value pairs
 * @param flat - Flat object with dot-notation keys
 * @param separator - Key separator (default: '.')
 * @returns Nested object structure
 */
export function unflattenObject<T = Record<string, unknown>>(
  flat: Record<string, unknown>,
  separator = ".",
): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(flat)) {
    const keys = key.split(separator);
    let current = result;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];

      // Skip empty keys or undefined
      if (!k) {
        continue;
      }

      // Security: Prevent prototype pollution
      if (k === "__proto__" || k === "constructor" || k === "prototype") {
        continue;
      }

      if (i === keys.length - 1) {
        current[k] = value;
      } else {
        if (!current[k] || typeof current[k] !== "object") {
          current[k] = {};
        }
        current = current[k] as Record<string, unknown>;
      }
    }
  }

  return result as T;
}
