import type { ValidationResult } from "../../../../types/validation/ValidationResult";

/**
 * Validates a role description according to schema constraints.
 *
 * @param description - The role description to validate
 * @returns Validation result with error message if invalid
 */
export function validateRoleDescription(description: string): ValidationResult {
  if (typeof description !== "string") {
    return { isValid: false, error: "Role description must be a string" };
  }
  if (description.length > 500) {
    return {
      isValid: false,
      error: `Role description cannot exceed 500 characters (current: ${description.length})`,
    };
  }
  return { isValid: true };
}
