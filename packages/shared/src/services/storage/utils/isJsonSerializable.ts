/**
 * Check if a value can be safely JSON serialized
 * @param value - The value to check
 * @returns true if the value is JSON serializable
 */
export function isJsonSerializable(value: unknown): boolean {
  try {
    const seen = new WeakSet();

    function check(val: unknown): boolean {
      // Primitives are always serializable
      if (
        val === null ||
        typeof val === "string" ||
        typeof val === "number" ||
        typeof val === "boolean"
      ) {
        return true;
      }

      // Functions and symbols are not serializable
      if (typeof val === "function" || typeof val === "symbol") {
        return false;
      }

      // undefined is technically serializable (becomes null)
      if (val === undefined) {
        return true;
      }

      // Handle objects and arrays
      if (typeof val === "object" && val !== null) {
        // Check for circular references
        if (seen.has(val)) {
          return false;
        }
        seen.add(val);

        // Check array elements
        if (Array.isArray(val)) {
          return val.every(check);
        }

        // Check object properties
        return Object.values(val).every(check);
      }

      return false;
    }

    return check(value);
  } catch {
    return false;
  }
}
