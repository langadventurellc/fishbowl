/**
 * Formats a field path for display.
 *
 * @param path - Array of path segments
 * @returns Formatted path string
 *
 * @example
 * formatFieldPath(["providers", 0, "configuration"]) // "providers[0].configuration"
 */
export function formatFieldPath(path: (string | number)[]): string {
  return path
    .map((segment, index) => {
      if (typeof segment === "number") {
        return `[${segment}]`;
      }
      return index === 0 ? segment : `.${segment}`;
    })
    .join("");
}
