import type { SettingsValidationResult } from "./SettingsValidationResult";

/**
 * Creates an empty validation result for successful validation
 * Utility function for creating consistent validation responses
 *
 * @returns A validation result indicating success
 */
export function createValidValidationResult(): SettingsValidationResult {
  return {
    isValid: true,
  };
}
