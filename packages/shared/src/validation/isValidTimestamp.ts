/**
 * Checks if a value is a valid ISO timestamp string.
 *
 * @param timestamp - Value to check
 * @returns True if valid ISO timestamp or null/undefined
 */
export function isValidTimestamp(timestamp: unknown): boolean {
  if (timestamp === null || timestamp === undefined) {
    return true; // null/undefined are valid
  }
  if (typeof timestamp !== "string") {
    return false;
  }
  try {
    const date = new Date(timestamp);
    return date.toISOString() === timestamp;
  } catch {
    return false;
  }
}
