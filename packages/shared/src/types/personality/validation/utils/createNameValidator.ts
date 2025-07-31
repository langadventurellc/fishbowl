/**
 * @fileoverview Name Validator Creator
 *
 * Creates name validators with configurable length limits.
 */

import { z } from "zod";
import { PERSONALITY_VALIDATION_ERRORS } from "../constants";

/**
 * Creates a name validator with configurable length limits
 */
export function createNameValidator() {
  return z
    .string()
    .min(2, PERSONALITY_VALIDATION_ERRORS.NAME_TOO_SHORT)
    .max(100, PERSONALITY_VALIDATION_ERRORS.NAME_TOO_LONG);
}
