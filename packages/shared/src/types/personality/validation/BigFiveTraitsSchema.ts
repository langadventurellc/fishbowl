/**
 * @fileoverview Big Five Traits Validation Schema
 *
 * Zod schema for validating BigFiveTraits interface with 0-100 integer range validation.
 * Provides comprehensive validation for all five personality traits with custom error messages.
 */

import { z } from "zod";
import { PERSONALITY_VALIDATION_ERRORS } from "./constants";

/**
 * Schema for validating Big Five personality traits
 *
 * Validates all five traits as integers between 0-100 inclusive:
 * - openness: Creativity and willingness to explore new ideas
 * - conscientiousness: Attention to detail and methodical approach
 * - extraversion: Verbosity and enthusiasm in responses
 * - agreeableness: Supportiveness versus critical analysis
 * - neuroticism: Confidence versus cautiousness in responses
 *
 * @example
 * ```typescript
 * const validTraits = {
 *   openness: 75,
 *   conscientiousness: 60,
 *   extraversion: 80,
 *   agreeableness: 70,
 *   neuroticism: 45
 * };
 *
 * const result = BigFiveTraitsSchema.parse(validTraits);
 * // Returns validated BigFiveTraits object
 * ```
 */
export const BigFiveTraitsSchema = z
  .object({
    openness: z
      .number()
      .int()
      .min(0, PERSONALITY_VALIDATION_ERRORS.OPENNESS_INVALID)
      .max(100, PERSONALITY_VALIDATION_ERRORS.OPENNESS_INVALID),
    conscientiousness: z
      .number()
      .int()
      .min(0, PERSONALITY_VALIDATION_ERRORS.CONSCIENTIOUSNESS_INVALID)
      .max(100, PERSONALITY_VALIDATION_ERRORS.CONSCIENTIOUSNESS_INVALID),
    extraversion: z
      .number()
      .int()
      .min(0, PERSONALITY_VALIDATION_ERRORS.EXTRAVERSION_INVALID)
      .max(100, PERSONALITY_VALIDATION_ERRORS.EXTRAVERSION_INVALID),
    agreeableness: z
      .number()
      .int()
      .min(0, PERSONALITY_VALIDATION_ERRORS.AGREEABLENESS_INVALID)
      .max(100, PERSONALITY_VALIDATION_ERRORS.AGREEABLENESS_INVALID),
    neuroticism: z
      .number()
      .int()
      .min(0, PERSONALITY_VALIDATION_ERRORS.NEUROTICISM_INVALID)
      .max(100, PERSONALITY_VALIDATION_ERRORS.NEUROTICISM_INVALID),
  })
  .strict();

/**
 * Type inference from BigFiveTraitsSchema
 *
 * This type should match the BigFiveTraits interface exactly.
 */
export type BigFiveTraitsValidated = z.infer<typeof BigFiveTraitsSchema>;
