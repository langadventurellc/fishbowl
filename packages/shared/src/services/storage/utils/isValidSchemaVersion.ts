/**
 * Validate schema version string format (semantic versioning)
 *
 * @param version The version string to validate
 * @returns True if the version follows semantic versioning format (major.minor.patch)
 */
export function isValidSchemaVersion(version: string): boolean {
  const versionPattern = /^\d+\.\d+\.\d+$/;
  return versionPattern.test(version);
}
