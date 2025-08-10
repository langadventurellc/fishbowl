import type { ValidationResult } from "../../../../types/validation/ValidationResult";

/**
 * Validates a role name according to schema constraints.
 *
 * @param name - The role name to validate
 * @returns Validation result with error message if invalid
 */
export function validateRoleName(name: string): ValidationResult {
  if (typeof name !== "string") {
    return { isValid: false, error: "Role name must be a string" };
  }
  if (name.length === 0) {
    return { isValid: false, error: "Role name is required" };
  }
  if (name.length > 100) {
    return {
      isValid: false,
      error: `Role name cannot exceed 100 characters (current: ${name.length})`,
    };
  }
  return { isValid: true };
}
