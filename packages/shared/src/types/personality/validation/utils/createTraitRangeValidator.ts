/**
 * @fileoverview Trait Range Validator Creator
 *
 * Creates validators for personality trait values (0-100 integers).
 * Based on existing patterns in CompatibilityResult.ts and ModelCapabilities.ts.
 */

import { z } from "zod";
import { PERSONALITY_VALIDATION_ERRORS } from "../constants";

/**
 * Creates a validator for personality trait values (0-100 integers)
 */
export function createTraitRangeValidator(fieldName?: string) {
  const errorMessage = fieldName
    ? `${fieldName} must be an integer between 0 and 100`
    : PERSONALITY_VALIDATION_ERRORS.TRAIT_OUT_OF_RANGE;

  return z.number().int().min(0, errorMessage).max(100, errorMessage);
}
