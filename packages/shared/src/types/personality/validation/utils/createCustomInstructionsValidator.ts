/**
 * @fileoverview Custom Instructions Validator Creator
 *
 * Creates custom instructions validators with 2000 character limit.
 */

import { z } from "zod";
import { PERSONALITY_VALIDATION_ERRORS } from "../constants";

/**
 * Creates a custom instructions validator with 2000 character limit
 */
export function createCustomInstructionsValidator() {
  return z
    .string()
    .max(2000, PERSONALITY_VALIDATION_ERRORS.CUSTOM_INSTRUCTIONS_TOO_LONG)
    .optional();
}
