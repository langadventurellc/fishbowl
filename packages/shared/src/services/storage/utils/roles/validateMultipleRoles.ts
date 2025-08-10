import { persistedRoleSchema } from "../../../../types/settings/rolesSettingsSchema";
import type { BatchValidationResult } from "./BatchValidationResult";
import { formatRolesValidationErrors } from "../formatRolesValidationErrors";

/**
 * Validates multiple roles with detailed batch reporting.
 * Provides comprehensive validation results for batch operations.
 *
 * @param roles - Array of role objects to validate
 * @returns Detailed batch validation results
 */
export function validateMultipleRoles(roles: unknown[]): BatchValidationResult {
  if (!Array.isArray(roles)) {
    return {
      totalCount: 0,
      validCount: 0,
      invalidCount: 1,
      validRoles: [],
      errors: [
        {
          index: 0,
          errors: [{ path: "root", message: "Input must be an array" }],
        },
      ],
    };
  }

  const result: BatchValidationResult = {
    totalCount: roles.length,
    validCount: 0,
    invalidCount: 0,
    validRoles: [],
    errors: [],
  };

  roles.forEach((role, index) => {
    const validation = persistedRoleSchema.safeParse(role);
    if (validation.success) {
      result.validCount++;
      result.validRoles.push(validation.data);
    } else {
      result.invalidCount++;
      const errors = formatRolesValidationErrors(validation.error);
      result.errors.push({ index, role, errors });
    }
  });

  return result;
}
