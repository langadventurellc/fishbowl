/**
 * @fileoverview Personality Creation Data Validation Schema
 *
 * Zod schema for validating PersonalityCreationData objects (without generated fields).
 * This schema is used for creating new personality configurations before generated
 * fields (id, createdAt, updatedAt) are added by the service layer.
 *
 * Features:
 * - All 19 personality traits validation (5 Big Five + 14 behavioral)
 * - Input sanitization for XSS prevention and whitespace normalization
 * - Required field validation: name, isTemplate, all traits
 * - Optional field validation: description, customInstructions
 * - Custom error messages for missing/invalid fields
 * - Strict mode to prevent excess properties
 */

import { z } from "zod";
import { PersonalityConfigurationSchema } from "./PersonalityConfigurationSchema";
import { createNameValidator } from "./utils/createNameValidator";
import { createOptionalDescriptionValidator } from "./utils/createOptionalDescriptionValidator";
import { createCustomInstructionsValidator } from "./utils/createCustomInstructionsValidator";
import { sanitizeString } from "./utils/sanitizeString";

/**
 * Personality Creation Data validation schema
 *
 * Validates PersonalityCreationData = Omit<PersonalityConfiguration, "id" | "createdAt" | "updatedAt">
 *
 * This schema omits the generated fields (id, createdAt, updatedAt) from the full
 * PersonalityConfigurationSchema and adds input sanitization transforms for text fields.
 *
 * Required fields:
 * - name: Non-empty string, max 100 characters (with sanitization)
 * - isTemplate: Boolean value
 * - All 19 personality traits: 0-100 integers
 *   - Big Five: openness, conscientiousness, extraversion, agreeableness, neuroticism
 *   - Behavioral: formality, humor, assertiveness, empathy, storytelling, brevity,
 *     imagination, playfulness, dramaticism, analyticalDepth, contrarianism,
 *     encouragement, curiosity, patience
 *
 * Optional fields:
 * - description: Optional string, max 500 characters (with sanitization)
 * - customInstructions: Optional string, max 2000 characters (with sanitization)
 *
 * @example
 * ```typescript
 * const creationData = {
 *   // Big Five traits
 *   openness: 75, conscientiousness: 60, extraversion: 80,
 *   agreeableness: 70, neuroticism: 45,
 *   // Behavioral traits
 *   formality: 70, humor: 85, assertiveness: 60, empathy: 90,
 *   storytelling: 75, brevity: 40, imagination: 80, playfulness: 65,
 *   dramaticism: 55, analyticalDepth: 85, contrarianism: 30,
 *   encouragement: 90, curiosity: 85, patience: 70,
 *   // Required metadata
 *   name: "  Creative Assistant  ", // Will be sanitized to "Creative Assistant"
 *   isTemplate: false,
 *   // Optional metadata
 *   description: "A creative personality",
 *   customInstructions: "Focus on creativity"
 * };
 *
 * const result = PersonalityCreationDataSchema.parse(creationData);
 * // Result will have sanitized string fields and validated traits
 * ```
 */
export const PersonalityCreationDataSchema =
  PersonalityConfigurationSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
    .extend({
      // Override string fields with sanitization transforms
      name: createNameValidator().transform(sanitizeString),
      description: createOptionalDescriptionValidator().transform((str) =>
        str ? sanitizeString(str) : str,
      ),
      customInstructions: createCustomInstructionsValidator().transform(
        (str) => (str ? sanitizeString(str) : str),
      ),
    })
    .strict();

/**
 * Type inference from PersonalityCreationDataSchema
 *
 * This type represents validated PersonalityCreationData with:
 * - All required fields validated and present
 * - String fields sanitized for XSS protection
 * - Trait values confirmed as 0-100 integers
 * - No excess properties (strict mode)
 */
export type PersonalityCreationDataValidated = z.infer<
  typeof PersonalityCreationDataSchema
>;
