import { persistedRoleSchema } from "../../../../types/settings/rolesSettingsSchema";
import { formatRolesValidationErrors } from "../formatRolesValidationErrors";

/**
 * Validates form data before saving, providing UI-friendly validation.
 * Uses the updated persistence schema that now requires systemPrompt.
 * Returns validation result without throwing errors.
 *
 * @param formData - Form data from UI
 * @returns Validation result with boolean flag and errors array
 *
 * @example
 * ```typescript
 * const { isValid, errors } = validateRoleFormData(formData);
 * if (!isValid) {
 *   displayErrors(errors);
 * }
 * ```
 */
export function validateRoleFormData(formData: {
  name: string;
  description: string;
  systemPrompt: string;
}): { isValid: boolean; errors: Array<{ path: string; message: string }> } {
  // Create a role object with minimal required fields for validation
  const roleData = {
    id: "temp-validation-id", // Temporary ID for validation
    ...formData,
    createdAt: null,
    updatedAt: null,
  };

  const result = persistedRoleSchema.safeParse(roleData);

  if (result.success) {
    return { isValid: true, errors: [] };
  }

  const errors = formatRolesValidationErrors(result.error);
  // Filter out ID-related errors since it's temporary
  const filteredErrors = errors.filter((e) => !e.path.includes("id"));

  return { isValid: filteredErrors.length === 0, errors: filteredErrors };
}
