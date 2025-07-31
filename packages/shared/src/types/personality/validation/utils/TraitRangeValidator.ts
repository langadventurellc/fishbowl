/**
 * @fileoverview Pre-compiled Trait Range Validator
 *
 * Performance-optimized validator for repeated validations.
 * Use this to avoid recompilation overhead.
 */

import { z } from "zod";
import { PERSONALITY_VALIDATION_ERRORS } from "../constants";

/**
 * Pre-compiled trait validator for performance optimization
 */
export const TraitRangeValidator = z
  .number()
  .int()
  .min(0, PERSONALITY_VALIDATION_ERRORS.TRAIT_OUT_OF_RANGE)
  .max(100, PERSONALITY_VALIDATION_ERRORS.TRAIT_OUT_OF_RANGE);
