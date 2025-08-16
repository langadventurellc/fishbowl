import { persistedPersonalitiesSettingsSchema } from "../../../../types/settings/personalitiesSettingsSchema";
import type { ValidationResult } from "../../../../validation/ValidationResult";
import { validateSinglePersonality } from "./validateSinglePersonality";

/**
 * Validates complete personalities settings file data
 * @param data - The personalities settings data to validate
 * @returns Detailed validation result
 */
export function validatePersonalitiesData(data: unknown): ValidationResult {
  if (data === null || data === undefined) {
    return {
      isValid: false,
      error: "Personalities data is required and cannot be null or undefined",
    };
  }

  // Check for basic structure before schema validation (to avoid defaults filling in missing fields)
  if (typeof data !== "object") {
    return {
      isValid: false,
      error: "Personalities data must be an object",
    };
  }

  const obj = data as Record<string, unknown>;

  // Check for required fields explicitly (before defaults apply)
  if (!("schemaVersion" in obj)) {
    return {
      isValid: false,
      error: "schemaVersion: Schema version is required",
    };
  }

  if (!("personalities" in obj)) {
    return {
      isValid: false,
      error: "personalities: Personalities array is required",
    };
  }

  if (!("lastUpdated" in obj)) {
    return {
      isValid: false,
      error: "lastUpdated: Last updated timestamp is required",
    };
  }

  // Now validate against the schema
  const schemaResult = persistedPersonalitiesSettingsSchema.safeParse(data);
  const allErrors: string[] = [];

  // If schema validation fails, collect those errors but continue with other validation if possible
  if (!schemaResult.success) {
    schemaResult.error.issues.forEach((issue) => {
      const fieldPath = issue.path.join(".");

      // Check if this is a personality-specific error
      if (fieldPath.startsWith("personalities.") && fieldPath.includes(".")) {
        const pathParts = fieldPath.split(".");
        if (pathParts.length >= 2 && !isNaN(Number(pathParts[1]))) {
          const personalityIndex = Number(pathParts[1]);
          const personalityField = pathParts.slice(2).join(".");
          allErrors.push(
            `Personality ${personalityIndex}: ${personalityField}: ${issue.message}`,
          );
        } else {
          allErrors.push(`${fieldPath}: ${issue.message}`);
        }
      } else {
        allErrors.push(`${fieldPath}: ${issue.message}`);
      }
    });
  }

  // Try to run uniqueness validation even if schema failed, as long as we have a personalities array
  if (obj.personalities && Array.isArray(obj.personalities)) {
    const uniquenessErrors = validatePersonalityUniqueness(obj.personalities);
    allErrors.push(...uniquenessErrors);
  }

  // If schema validation passed, also run individual personality validation for any additional checks
  if (schemaResult.success) {
    const parsedData = schemaResult.data;

    parsedData.personalities.forEach((personality, index) => {
      const result = validateSinglePersonality(personality);
      if (!result.isValid) {
        const errors = result.error ? [result.error] : result.errors || [];
        errors.forEach((error) => {
          allErrors.push(`Personality ${index}: ${error}`);
        });
      }
    });
  }

  if (allErrors.length === 0) {
    return { isValid: true };
  }

  return {
    isValid: false,
    error: allErrors.length === 1 ? allErrors[0] : undefined,
    errors: allErrors.length > 1 ? allErrors : undefined,
  };
}

/**
 * Validates uniqueness of personality IDs and names
 * @param personalities - Array of personalities to check
 * @returns Array of uniqueness errors
 */
function validatePersonalityUniqueness(personalities: unknown[]): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  personalities.forEach((personality, index) => {
    const p = personality as Record<string, unknown>;

    if (p?.id && typeof p.id === "string") {
      if (seenIds.has(p.id)) {
        errors.push(
          `Duplicate personality ID '${p.id}' found at index ${index}`,
        );
      } else {
        seenIds.add(p.id);
      }
    }

    if (p?.name && typeof p.name === "string") {
      const nameLower = p.name.toLowerCase();
      if (seenNames.has(nameLower)) {
        errors.push(
          `Duplicate personality name '${p.name}' found at index ${index} (case-insensitive match)`,
        );
      } else {
        seenNames.add(nameLower);
      }
    }
  });

  return errors;
}
