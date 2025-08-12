import { persistedRoleSchema } from "../../../../types/settings/rolesSettingsSchema";
import type { PersistedRoleData } from "../../../../types/settings/PersistedRoleData";
import { validateRolesData } from "../validateRolesData";

/**
 * Validates a single role object against the persistedRoleSchema.
 * Provides detailed error information with context.
 *
 * @param roleData - The role data to validate
 * @param context - Optional context string for error messages
 * @returns The validated and typed PersistedRoleData
 * @throws SettingsValidationError with field-level error details
 *
 * @example
 * ```typescript
 * const validatedRole = validateSingleRole(roleData, "Role creation");
 * ```
 */
export function validateSingleRole(
  roleData: unknown,
  context?: string,
): PersistedRoleData {
  return validateRolesData(
    roleData,
    persistedRoleSchema,
    context || "single-role",
    "validateSingleRole",
  );
}
