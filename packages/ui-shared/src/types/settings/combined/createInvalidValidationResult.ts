import type { SettingsValidationResult } from "./SettingsValidationResult";
import type { SettingsCategory } from "./SettingsCategory";

/**
 * Creates a validation result with errors
 * Utility function for creating consistent error responses
 *
 * @param errors - Errors by category
 * @param warnings - Optional warnings by category
 * @returns A validation result indicating failure with details
 */
export function createInvalidValidationResult(
  errors: Record<SettingsCategory, string[]>,
  warnings?: Record<SettingsCategory, string[]>,
): SettingsValidationResult {
  return {
    isValid: false,
    errors,
    warnings,
  };
}
