/**
 * @fileoverview Name Validator Creator
 *
 * Creates name validators with configurable length limits and automatic sanitization.
 */

import { z } from "zod";
import { PERSONALITY_VALIDATION_ERRORS } from "../constants";
import { sanitizeString } from "./sanitizeString";

/**
 * Creates a name validator with configurable length limits and XSS sanitization
 *
 * Automatically applies sanitization to prevent XSS attacks by:
 * - Trimming whitespace
 * - Removing HTML-like angle brackets
 * - Normalizing multiple whitespace to single spaces
 */
export function createNameValidator() {
  return z
    .string()
    .min(2, PERSONALITY_VALIDATION_ERRORS.NAME_TOO_SHORT)
    .max(100, PERSONALITY_VALIDATION_ERRORS.NAME_TOO_LONG)
    .transform(sanitizeString);
}
