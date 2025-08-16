import { persistedPersonalitySchema } from "../../../../types/settings/personalitiesSettingsSchema";
import type { ValidationResult } from "../../../../validation/ValidationResult";

/**
 * Validates a single personality against the persistence schema
 * @param personality - The personality data to validate
 * @returns Detailed validation result with errors if validation fails
 */
export function validateSinglePersonality(
  personality: unknown,
): ValidationResult {
  if (personality === null || personality === undefined) {
    return {
      isValid: false,
      error: "Personality data is required and cannot be null or undefined",
    };
  }

  const result = persistedPersonalitySchema.safeParse(personality);

  if (result.success) {
    return {
      isValid: true,
    };
  }

  // Format Zod validation errors into user-friendly messages
  const errors = result.error.issues.map((issue) => {
    const fieldPath = issue.path.join(".");
    return `${fieldPath}: ${issue.message}`;
  });

  return {
    isValid: false,
    error: errors.length === 1 ? errors[0] : undefined,
    errors: errors.length > 1 ? errors : undefined,
  };
}
