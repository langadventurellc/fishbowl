/**
 * @fileoverview Custom Instructions Validator Creator
 *
 * Creates custom instructions validators with 2000 character limit and automatic sanitization.
 */

import { z } from "zod";
import { PERSONALITY_VALIDATION_ERRORS } from "../constants";
import { sanitizeString } from "./sanitizeString";

/**
 * Creates a custom instructions validator with XSS sanitization
 *
 * Automatically applies sanitization to prevent XSS attacks by:
 * - Trimming whitespace
 * - Removing HTML-like angle brackets
 * - Normalizing multiple whitespace to single spaces
 *
 * Only sanitizes when value is present (not undefined)
 */
export function createCustomInstructionsValidator() {
  return z
    .string()
    .max(2000, PERSONALITY_VALIDATION_ERRORS.CUSTOM_INSTRUCTIONS_TOO_LONG)
    .optional()
    .transform((str) => (str ? sanitizeString(str) : str));
}
