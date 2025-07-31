/**
 * Type guard to check if string is valid JSON
 *
 * @param value The string to validate
 * @returns True if the string is valid JSON, false otherwise
 */
export function isValidJson(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}
