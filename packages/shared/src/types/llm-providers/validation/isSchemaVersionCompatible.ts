/**
 * Checks if a schema version is compatible with the current version.
 *
 * @fileoverview Schema version compatibility utility
 * @module types/llm-providers/validation/isSchemaVersionCompatible
 */

/**
 * Checks if a schema version is compatible with the current version.
 * Uses semantic versioning rules: major version must match, minor/patch can be higher.
 *
 * @param dataVersion - Version from the data being validated
 * @param currentVersion - Current schema version to check against
 * @returns True if versions are compatible
 *
 * @example
 * ```typescript
 * const isCompatible = isSchemaVersionCompatible('1.2.0', '1.0.0'); // true
 * const isIncompatible = isSchemaVersionCompatible('2.0.0', '1.0.0'); // false
 * const isOldPatch = isSchemaVersionCompatible('1.0.0', '1.0.1'); // true
 * ```
 */
export function isSchemaVersionCompatible(
  dataVersion: string,
  currentVersion: string,
): boolean {
  // Validate version format
  const versionRegex = /^\d+\.\d+\.\d+$/;
  if (!versionRegex.test(dataVersion) || !versionRegex.test(currentVersion)) {
    return false;
  }

  const parseVersion = (version: string) => {
    const parts = version.split(".").map(Number);
    const [major = 0, minor = 0, patch = 0] = parts;

    // Validate all parts are valid numbers
    if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
      return null;
    }

    return { major, minor, patch };
  };

  const data = parseVersion(dataVersion);
  const current = parseVersion(currentVersion);

  // Return false if either version failed to parse
  if (!data || !current) {
    return false;
  }

  // Major version must match exactly
  if (data.major !== current.major) {
    return false;
  }

  // Minor and patch versions can be equal or higher in data
  if (data.minor > current.minor) {
    return true;
  }
  if (data.minor === current.minor) {
    return data.patch >= current.patch;
  }

  return false;
}
