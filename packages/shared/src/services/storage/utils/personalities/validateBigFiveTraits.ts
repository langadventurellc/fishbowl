import type { ValidationResult } from "../../../../validation/ValidationResult";
import { BIG_FIVE_TRAITS } from "./bigFiveTraits";
import { validateBigFiveTrait } from "./validateBigFiveTrait";

/**
 * Validates Big Five personality traits structure and values
 * @param bigFive - The Big Five traits object to validate
 * @returns Validation result with errors if any issues found
 */
export function validateBigFiveTraits(bigFive: unknown): ValidationResult {
  if (bigFive === null || bigFive === undefined) {
    return {
      isValid: false,
      error: "Big Five traits data is required and cannot be null or undefined",
    };
  }

  if (typeof bigFive !== "object") {
    return {
      isValid: false,
      error: "Big Five traits must be an object",
    };
  }

  const errors: string[] = [];
  const traits = bigFive as Record<string, unknown>;

  // Check for missing traits
  for (const trait of BIG_FIVE_TRAITS) {
    if (!(trait in traits)) {
      errors.push(`Big Five trait '${trait}' is required`);
    }
  }

  // Validate each present trait
  for (const trait of BIG_FIVE_TRAITS) {
    if (trait in traits) {
      const traitError = validateBigFiveTrait(trait, traits[trait]);
      if (traitError) {
        errors.push(traitError);
      }
    }
  }

  if (errors.length === 0) {
    return { isValid: true };
  }

  return {
    isValid: false,
    error: errors.length === 1 ? errors[0] : undefined,
    errors: errors.length > 1 ? errors : undefined,
  };
}
