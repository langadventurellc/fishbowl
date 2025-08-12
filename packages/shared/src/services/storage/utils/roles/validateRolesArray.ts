import { persistedRoleSchema } from "../../../../types/settings/rolesSettingsSchema";
import type { PersistedRoleData } from "../../../../types/settings/PersistedRoleData";
import { formatRolesValidationErrors } from "../formatRolesValidationErrors";

/**
 * Validates an array of roles with optional partial failure handling.
 *
 * @param rolesArray - Array of role objects to validate
 * @param allowPartialFailure - If true, returns valid roles even if some fail
 * @returns Object containing valid roles and validation errors
 *
 * @example
 * ```typescript
 * const { validRoles, errors } = validateRolesArray(importedRoles, true);
 * console.log(`Imported ${validRoles.length} valid roles`);
 * ```
 */
export function validateRolesArray(
  rolesArray: unknown,
  allowPartialFailure = false,
): {
  validRoles: PersistedRoleData[];
  errors: Array<{ path: string; message: string }>;
} {
  if (!Array.isArray(rolesArray)) {
    return {
      validRoles: [],
      errors: [{ path: "root", message: "Input must be an array of roles" }],
    };
  }

  const validRoles: PersistedRoleData[] = [];
  const allErrors: Array<{ path: string; message: string }> = [];

  for (let index = 0; index < rolesArray.length; index++) {
    const role = rolesArray[index];
    const result = persistedRoleSchema.safeParse(role);
    if (result.success) {
      validRoles.push(result.data);
    } else {
      const errors = formatRolesValidationErrors(result.error);
      // Prefix errors with array index for context
      const indexedErrors = errors.map((e) => ({
        path: `roles.${index}.${e.path}`,
        message: e.message,
      }));
      allErrors.push(...indexedErrors);

      if (!allowPartialFailure) {
        // Stop processing on first error if not allowing partial failure
        return { validRoles, errors: allErrors };
      }
    }
  }

  return { validRoles, errors: allErrors };
}
