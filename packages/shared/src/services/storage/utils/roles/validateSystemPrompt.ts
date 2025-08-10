import type { ValidationResult } from "../../../../validation/ValidationResult";

/**
 * Validates a system prompt according to schema constraints.
 *
 * @param prompt - The system prompt to validate
 * @returns Validation result with error message if invalid
 */
export function validateSystemPrompt(prompt: string): ValidationResult {
  if (typeof prompt !== "string") {
    return { isValid: false, error: "System prompt must be a string" };
  }
  if (prompt.length > 5000) {
    return {
      isValid: false,
      error: `System prompt cannot exceed 5000 characters (current: ${prompt.length})`,
    };
  }
  return { isValid: true };
}
