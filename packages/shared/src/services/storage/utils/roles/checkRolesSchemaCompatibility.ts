/**
 * Checks if data is compatible with the current schema version.
 * Useful for migration scenarios and version compatibility checks.
 *
 * @param data - Data to check for compatibility
 * @returns Compatibility result with issues list
 *
 * @example
 * ```typescript
 * const { compatible, issues } = checkRolesSchemaCompatibility(importedData);
 * if (!compatible) {
 *   console.warn("Schema compatibility issues:", issues);
 * }
 * ```
 */
export function checkRolesSchemaCompatibility(data: unknown): {
  compatible: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check basic structure
  if (!data || typeof data !== "object") {
    issues.push("Data must be an object");
    return { compatible: false, issues };
  }

  const dataObj = data as Record<string, unknown>;

  // Check schema version if present
  if ("schemaVersion" in dataObj) {
    const version = dataObj.schemaVersion;
    if (typeof version !== "string") {
      issues.push("Schema version must be a string");
    } else if (!version.match(/^\d+\.\d+\.\d+$/)) {
      issues.push(`Invalid schema version format: ${version}`);
    }
  }

  // Check roles array structure
  if ("roles" in dataObj) {
    if (!Array.isArray(dataObj.roles)) {
      issues.push("Roles must be an array");
    } else {
      // Check each role for required fields
      dataObj.roles.forEach((role, index) => {
        if (!role || typeof role !== "object") {
          issues.push(`Role at index ${index} is not an object`);
        } else {
          const roleObj = role as Record<string, unknown>;
          if (!("id" in roleObj)) {
            issues.push(`Role at index ${index} missing required field: id`);
          }
          if (!("name" in roleObj)) {
            issues.push(`Role at index ${index} missing required field: name`);
          }
        }
      });
    }
  }

  return { compatible: issues.length === 0, issues };
}
