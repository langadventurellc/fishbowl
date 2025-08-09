import type { ValidationResult } from "./ValidationResult";

/**
 * Validates configuration name for uniqueness (case-insensitive)
 *
 * @param newName - The new configuration name to validate
 * @param existingNames - Array of existing configuration names
 * @param currentId - Optional ID of config being updated (to allow keeping same name)
 * @param currentName - Optional current name when updating
 * @returns Validation result with error message if duplicate found
 */
export function validateUniqueConfigName(
  newName: string,
  existingNames: string[] = [],
  currentId?: string,
  currentName?: string,
): ValidationResult {
  // Basic validation
  if (!newName || typeof newName !== "string") {
    return {
      isValid: false,
      error: "Configuration name must be a non-empty string",
    };
  }

  // Check if trimmed name is empty
  const normalizedNewName = newName.toLowerCase().trim();
  if (!normalizedNewName) {
    return {
      isValid: false,
      error: "Configuration name must be a non-empty string",
    };
  }

  // Allow keeping the same name when updating
  if (currentName && newName === currentName) {
    return { isValid: true };
  }

  // Check for case-insensitive duplicates
  const isDuplicate = existingNames.some(
    (name) => name.toLowerCase().trim() === normalizedNewName,
  );

  if (isDuplicate) {
    return {
      isValid: false,
      error:
        "Configuration name already exists. Please choose a different name.",
    };
  }

  return { isValid: true };
}
