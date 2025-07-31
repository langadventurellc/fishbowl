/**
 * Safely stringify object to JSON with circular reference handling
 * @param obj - The object to stringify
 * @param space - Optional indentation for pretty printing
 * @returns JSON string or undefined if serialization fails
 */
export function safeJsonStringify(
  obj: unknown,
  space?: number,
): string | undefined {
  try {
    const seen = new WeakSet();
    return JSON.stringify(
      obj,
      (_key, value) => {
        // Handle circular references
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return undefined; // Remove circular references
          }
          seen.add(value);
        }
        // Filter out functions and undefined
        if (typeof value === "function" || value === undefined) {
          return undefined;
        }
        return value;
      },
      space,
    );
  } catch {
    return undefined;
  }
}
