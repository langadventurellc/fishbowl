/**
 * @fileoverview Optional Description Validator Creator
 *
 * Creates optional description validators with length limits.
 */

import { z } from "zod";
import { PERSONALITY_VALIDATION_ERRORS } from "../constants";

/**
 * Creates an optional description validator
 */
export function createOptionalDescriptionValidator() {
  return z
    .string()
    .max(500, PERSONALITY_VALIDATION_ERRORS.DESCRIPTION_TOO_LONG)
    .optional();
}
