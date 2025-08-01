/**
 * Reconstruct nested structure from flat key-value pairs
 * @param obj - Flat object with dot-notation keys
 * @returns Nested object structure
 */
export function unflattenObject(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const key in obj) {
    const keys = key.split(".");
    let current: Record<string, unknown> = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (k && !(k in current)) {
        current[k] = {};
      }
      if (k) {
        current = current[k] as Record<string, unknown>;
      }
    }

    const lastKey = keys[keys.length - 1];
    if (lastKey) {
      current[lastKey] = obj[key];
    }
  }

  return result;
}
