import { isValidSchemaVersion } from "./isValidSchemaVersion.js";

/**
 * Parse semantic version string into components
 *
 * @param version The version string to parse
 * @returns Structured version object or null if parsing fails
 */
export function parseSchemaVersion(
  version: string,
): { major: number; minor: number; patch: number } | null {
  if (!isValidSchemaVersion(version)) {
    return null;
  }

  const parts = version.split(".");

  // Ensure we have exactly 3 parts (should be guaranteed by isValidSchemaVersion)
  if (parts.length !== 3) {
    return null;
  }

  const major = parseInt(parts[0]!, 10);
  const minor = parseInt(parts[1]!, 10);
  const patch = parseInt(parts[2]!, 10);

  // This should not happen since isValidSchemaVersion already validates the format
  // But we include this check for type safety
  if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
    return null;
  }

  return { major, minor, patch };
}
