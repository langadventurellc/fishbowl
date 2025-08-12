/**
 * Creates a user-friendly summary of roles validation errors.
 * Groups errors by field and provides an overview of issues.
 *
 * @param fieldErrors - Array of field errors to summarize
 * @returns Human-readable summary string
 *
 * @example
 * ```typescript
 * const errors = [
 *   { path: "roles.0.name", message: "Role name is required" },
 *   { path: "roles.0.description", message: "Description too long" }
 * ];
 * const summary = createRolesValidationSummary(errors);
 * console.log(summary); // "Role 1 has 2 validation issues."
 * ```
 */
export function createRolesValidationSummary(
  fieldErrors: Array<{ path: string; message: string }>,
): string {
  if (fieldErrors.length === 0) {
    return "";
  }

  if (fieldErrors.length === 1) {
    return fieldErrors[0]?.message || "Role validation error occurred";
  }

  // Group errors by role index if multiple roles have errors
  const roleErrors = new Map<
    number,
    Array<{ path: string; message: string }>
  >();
  const topLevelErrors: Array<{ path: string; message: string }> = [];

  fieldErrors.forEach((error) => {
    const pathParts = error.path.split(".");
    if (pathParts[0] === "roles" && pathParts.length > 2) {
      const roleIndexStr = pathParts[1];
      if (roleIndexStr !== undefined) {
        const roleIndex = parseInt(roleIndexStr, 10);
        if (!roleErrors.has(roleIndex)) {
          roleErrors.set(roleIndex, []);
        }
        roleErrors.get(roleIndex)?.push(error);
      }
    } else {
      topLevelErrors.push(error);
    }
  });

  // Build summary message
  const parts: string[] = [];

  if (topLevelErrors.length > 0) {
    parts.push(
      `${topLevelErrors.length} configuration error${topLevelErrors.length > 1 ? "s" : ""}`,
    );
  }

  if (roleErrors.size > 0) {
    if (roleErrors.size === 1) {
      const firstEntry = Array.from(roleErrors.entries())[0];
      if (firstEntry !== undefined) {
        const [index, errors] = firstEntry;
        parts.push(
          `Role ${index + 1} has ${errors.length} validation issue${errors.length > 1 ? "s" : ""}`,
        );
      }
    } else {
      parts.push(`${roleErrors.size} roles have validation errors`);
    }
  }

  return parts.join(". ") + ".";
}
