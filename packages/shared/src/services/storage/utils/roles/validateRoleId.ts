import type { ValidationResult } from "../../../../validation/ValidationResult";

/**
 * Validates a role ID according to schema constraints.
 *
 * @param id - The role ID to validate
 * @returns Validation result with error message if invalid
 */
export function validateRoleId(id: string): ValidationResult {
  if (typeof id !== "string") {
    return { isValid: false, error: "Role ID must be a string" };
  }
  if (id.length === 0) {
    return { isValid: false, error: "Role ID cannot be empty" };
  }
  return { isValid: true };
}
