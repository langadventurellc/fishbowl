/**
 * Safely parse JSON string with error handling
 * @param jsonString - The JSON string to parse
 * @param fallback - Optional fallback value if parsing fails
 * @returns Parsed object or fallback/undefined if parsing fails
 */
export function safeJsonParse<T>(
  jsonString: string,
  fallback?: T,
): T | undefined {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
}
