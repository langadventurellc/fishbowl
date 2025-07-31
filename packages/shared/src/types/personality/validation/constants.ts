/**
 * @fileoverview Personality Validation Error Constants
 *
 * Centralized error messages for personality configuration validation.
 * Used by Zod schemas to provide consistent, user-friendly error messages.
 */

export const PERSONALITY_VALIDATION_ERRORS = {
  // General validation errors
  NAME_REQUIRED: "Personality name is required",
  NAME_TOO_SHORT: "Personality name must be at least 2 characters long",
  NAME_TOO_LONG: "Personality name must be no more than 100 characters long",
  DESCRIPTION_TOO_LONG:
    "Personality description must be no more than 500 characters long",
  CUSTOM_INSTRUCTIONS_TOO_LONG:
    "Custom instructions must be no more than 2000 characters long",
  INVALID_UUID: "Invalid UUID format",

  // Trait validation errors
  TRAIT_REQUIRED: "Trait value is required",
  TRAIT_INVALID_TYPE: "Trait value must be a number",
  TRAIT_OUT_OF_RANGE: "Trait value must be between 0 and 100",
  TRAIT_NOT_INTEGER: "Trait value must be an integer",

  // Big Five trait specific errors
  OPENNESS_INVALID: "Openness must be an integer between 0 and 100",
  CONSCIENTIOUSNESS_INVALID:
    "Conscientiousness must be an integer between 0 and 100",
  EXTRAVERSION_INVALID: "Extraversion must be an integer between 0 and 100",
  AGREEABLENESS_INVALID: "Agreeableness must be an integer between 0 and 100",
  NEUROTICISM_INVALID: "Neuroticism must be an integer between 0 and 100",

  // Behavioral trait specific errors
  FORMALITY_INVALID: "Formality must be an integer between 0 and 100",
  HUMOR_INVALID: "Humor must be an integer between 0 and 100",
  ASSERTIVENESS_INVALID: "Assertiveness must be an integer between 0 and 100",
  EMPATHY_INVALID: "Empathy must be an integer between 0 and 100",
  STORYTELLING_INVALID: "Storytelling must be an integer between 0 and 100",
  BREVITY_INVALID: "Brevity must be an integer between 0 and 100",
  IMAGINATION_INVALID: "Imagination must be an integer between 0 and 100",
  PLAYFULNESS_INVALID: "Playfulness must be an integer between 0 and 100",
  DRAMATICISM_INVALID: "Dramaticism must be an integer between 0 and 100",
  ANALYTICAL_DEPTH_INVALID:
    "Analytical depth must be an integer between 0 and 100",
  CONTRARIANISM_INVALID: "Contrarianism must be an integer between 0 and 100",
  ENCOURAGEMENT_INVALID: "Encouragement must be an integer between 0 and 100",
  CURIOSITY_INVALID: "Curiosity must be an integer between 0 and 100",
  PATIENCE_INVALID: "Patience must be an integer between 0 and 100",

  // Business rules
  TEMPLATE_MODIFICATION_FORBIDDEN: "Template personalities cannot be modified",
  PERSONALITY_NOT_FOUND: "Personality not found",
  DUPLICATE_PERSONALITY_NAME: "A personality with this name already exists",
} as const;
