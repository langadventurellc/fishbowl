/**
 * @fileoverview Optional Description Validator Creator
 *
 * Creates optional description validators with length limits and automatic sanitization.
 */

import { z } from "zod";
import { PERSONALITY_VALIDATION_ERRORS } from "../constants";
import { sanitizeString } from "./sanitizeString";

/**
 * Creates an optional description validator with XSS sanitization
 *
 * Automatically applies sanitization to prevent XSS attacks by:
 * - Trimming whitespace
 * - Removing HTML-like angle brackets
 * - Normalizing multiple whitespace to single spaces
 *
 * Only sanitizes when value is present (not undefined)
 */
export function createOptionalDescriptionValidator() {
  return z
    .string()
    .max(500, PERSONALITY_VALIDATION_ERRORS.DESCRIPTION_TOO_LONG)
    .optional()
    .transform((str) => (str ? sanitizeString(str) : str));
}
