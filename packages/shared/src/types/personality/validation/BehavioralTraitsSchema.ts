/**
 * @fileoverview Behavioral Traits Validation Schema
 *
 * Zod schema for validating BehavioralTraits interface with 0-100 integer range validation.
 * Provides comprehensive validation for all 14 behavioral traits with custom error messages.
 */

import { z } from "zod";
import { PERSONALITY_VALIDATION_ERRORS } from "./constants";

/**
 * Schema for validating behavioral personality traits
 *
 * Validates all 14 behavioral traits as integers between 0-100 inclusive:
 * - formality: Professional to casual communication style (0-100)
 * - humor: Serious to playful responses (0-100)
 * - assertiveness: Suggestive to directive communication (0-100)
 * - empathy: Logical to emotionally aware responses (0-100)
 * - storytelling: Factual to narrative-driven explanations (0-100)
 * - brevity: Concise to detailed responses (0-100)
 * - imagination: Practical to creative suggestions (0-100)
 * - playfulness: Task-focused to spontaneous interactions (0-100)
 * - dramaticism: Matter-of-fact to theatrical expressions (0-100)
 * - analyticalDepth: Surface-level to comprehensive analysis (0-100)
 * - contrarianism: Consensus-building to challenging assumptions (0-100)
 * - encouragement: Neutral to supportive feedback (0-100)
 * - curiosity: Direct answers to exploratory questions (0-100)
 * - patience: Direct to accommodating explanations (0-100)
 *
 * @example
 * ```typescript
 * const validTraits = {
 *   formality: 70,
 *   humor: 85,
 *   assertiveness: 60,
 *   empathy: 90,
 *   storytelling: 75,
 *   brevity: 40,
 *   imagination: 80,
 *   playfulness: 65,
 *   dramaticism: 55,
 *   analyticalDepth: 85,
 *   contrarianism: 30,
 *   encouragement: 90,
 *   curiosity: 85,
 *   patience: 70
 * };
 *
 * const result = BehavioralTraitsSchema.parse(validTraits);
 * // Returns validated BehavioralTraits object
 * ```
 */
export const BehavioralTraitsSchema = z
  .object({
    formality: z
      .number()
      .int()
      .min(0, PERSONALITY_VALIDATION_ERRORS.FORMALITY_INVALID)
      .max(100, PERSONALITY_VALIDATION_ERRORS.FORMALITY_INVALID),
    humor: z
      .number()
      .int()
      .min(0, PERSONALITY_VALIDATION_ERRORS.HUMOR_INVALID)
      .max(100, PERSONALITY_VALIDATION_ERRORS.HUMOR_INVALID),
    assertiveness: z
      .number()
      .int()
      .min(0, PERSONALITY_VALIDATION_ERRORS.ASSERTIVENESS_INVALID)
      .max(100, PERSONALITY_VALIDATION_ERRORS.ASSERTIVENESS_INVALID),
    empathy: z
      .number()
      .int()
      .min(0, PERSONALITY_VALIDATION_ERRORS.EMPATHY_INVALID)
      .max(100, PERSONALITY_VALIDATION_ERRORS.EMPATHY_INVALID),
    storytelling: z
      .number()
      .int()
      .min(0, PERSONALITY_VALIDATION_ERRORS.STORYTELLING_INVALID)
      .max(100, PERSONALITY_VALIDATION_ERRORS.STORYTELLING_INVALID),
    brevity: z
      .number()
      .int()
      .min(0, PERSONALITY_VALIDATION_ERRORS.BREVITY_INVALID)
      .max(100, PERSONALITY_VALIDATION_ERRORS.BREVITY_INVALID),
    imagination: z
      .number()
      .int()
      .min(0, PERSONALITY_VALIDATION_ERRORS.IMAGINATION_INVALID)
      .max(100, PERSONALITY_VALIDATION_ERRORS.IMAGINATION_INVALID),
    playfulness: z
      .number()
      .int()
      .min(0, PERSONALITY_VALIDATION_ERRORS.PLAYFULNESS_INVALID)
      .max(100, PERSONALITY_VALIDATION_ERRORS.PLAYFULNESS_INVALID),
    dramaticism: z
      .number()
      .int()
      .min(0, PERSONALITY_VALIDATION_ERRORS.DRAMATICISM_INVALID)
      .max(100, PERSONALITY_VALIDATION_ERRORS.DRAMATICISM_INVALID),
    analyticalDepth: z
      .number()
      .int()
      .min(0, PERSONALITY_VALIDATION_ERRORS.ANALYTICAL_DEPTH_INVALID)
      .max(100, PERSONALITY_VALIDATION_ERRORS.ANALYTICAL_DEPTH_INVALID),
    contrarianism: z
      .number()
      .int()
      .min(0, PERSONALITY_VALIDATION_ERRORS.CONTRARIANISM_INVALID)
      .max(100, PERSONALITY_VALIDATION_ERRORS.CONTRARIANISM_INVALID),
    encouragement: z
      .number()
      .int()
      .min(0, PERSONALITY_VALIDATION_ERRORS.ENCOURAGEMENT_INVALID)
      .max(100, PERSONALITY_VALIDATION_ERRORS.ENCOURAGEMENT_INVALID),
    curiosity: z
      .number()
      .int()
      .min(0, PERSONALITY_VALIDATION_ERRORS.CURIOSITY_INVALID)
      .max(100, PERSONALITY_VALIDATION_ERRORS.CURIOSITY_INVALID),
    patience: z
      .number()
      .int()
      .min(0, PERSONALITY_VALIDATION_ERRORS.PATIENCE_INVALID)
      .max(100, PERSONALITY_VALIDATION_ERRORS.PATIENCE_INVALID),
  })
  .strict();

/**
 * Type inference from BehavioralTraitsSchema
 *
 * This type should match the BehavioralTraits interface exactly.
 */
export type BehavioralTraitsValidated = z.infer<typeof BehavioralTraitsSchema>;
