import { z } from "zod";

/**
 * Schema version constant for personalities configuration.
 * Used for schema evolution and migration support.
 */
export const PERSONALITIES_SCHEMA_VERSION = "1.0.0";

/**
 * Current schema version alias for consistency with application patterns.
 */
export const CURRENT_PERSONALITIES_SCHEMA_VERSION =
  PERSONALITIES_SCHEMA_VERSION;

/**
 * Zod schema for validating persisted personality data.
 *
 * Features:
 * - Comprehensive validation with security limits
 * - Clear error messages for validation failures
 * - Nullable timestamps for manual JSON editing
 * - No sensitive data exposure in validation errors
 * - Character limits to prevent DoS attacks
 * - Big Five personality trait validation (0-100 range)
 * - Behaviors validation as key-value pairs
 */
export const persistedPersonalitySchema = z
  .object({
    // Unique identifier - required, non-empty string
    id: z
      .string({ message: "Personality ID must be a string" })
      .min(1, "Personality ID cannot be empty"),

    // Display name with character limits
    name: z
      .string({ message: "Personality name must be a string" })
      .min(1, "Personality name is required")
      .max(50, "Personality name cannot exceed 50 characters"),

    // Big Five personality traits - all required, 0-100 range
    bigFive: z.object(
      {
        openness: z
          .number({ message: "Openness must be a number" })
          .min(0, "Openness must be at least 0")
          .max(100, "Openness cannot exceed 100"),

        conscientiousness: z
          .number({ message: "Conscientiousness must be a number" })
          .min(0, "Conscientiousness must be at least 0")
          .max(100, "Conscientiousness cannot exceed 100"),

        extraversion: z
          .number({ message: "Extraversion must be a number" })
          .min(0, "Extraversion must be at least 0")
          .max(100, "Extraversion cannot exceed 100"),

        agreeableness: z
          .number({ message: "Agreeableness must be a number" })
          .min(0, "Agreeableness must be at least 0")
          .max(100, "Agreeableness cannot exceed 100"),

        neuroticism: z
          .number({ message: "Neuroticism must be a number" })
          .min(0, "Neuroticism must be at least 0")
          .max(100, "Neuroticism cannot exceed 100"),
      },
      {
        message:
          "Big Five traits must be an object with all required properties",
      },
    ),

    // Behaviors as record of string to number (0-100 range)
    behaviors: z.record(
      z.string({ message: "Behavior keys must be strings" }),
      z
        .number({ message: "Behavior values must be numbers" })
        .min(0, "Behavior values must be at least 0")
        .max(100, "Behavior values cannot exceed 100"),
      {
        message:
          "Behaviors must be an object with string keys and numeric values",
      },
    ),

    // Custom instructions with security-conscious limits
    customInstructions: z
      .string({ message: "Custom instructions must be a string" })
      .max(500, "Custom instructions cannot exceed 500 characters"),

    // Timestamps - nullable and optional for manual JSON edits
    createdAt: z
      .string({ message: "Created timestamp must be a string" })
      .datetime({ message: "Created timestamp must be a valid ISO datetime" })
      .nullable()
      .optional(),

    updatedAt: z
      .string({ message: "Updated timestamp must be a string" })
      .datetime({ message: "Updated timestamp must be a valid ISO datetime" })
      .nullable()
      .optional(),
  })
  .passthrough(); // Allow unknown fields for schema evolution

/**
 * Master Zod schema for validating complete personalities settings file.
 *
 * Features:
 * - Schema versioning for migration support
 * - Array of validated personality objects
 * - Automatic timestamp generation
 * - Schema evolution support with .passthrough()
 * - Clear error messages for validation failures
 */
export const persistedPersonalitiesSettingsSchema = z
  .object({
    // Schema versioning for migration support
    schemaVersion: z
      .string({ message: "Schema version must be a string" })
      .min(1, "Schema version cannot be empty")
      .default(CURRENT_PERSONALITIES_SCHEMA_VERSION),

    // Array of personality configurations
    personalities: z
      .array(persistedPersonalitySchema, {
        message: "Personalities must be an array of personality objects",
      })
      .default([]),

    // Metadata with automatic generation
    lastUpdated: z
      .string({ message: "Last updated must be an ISO timestamp string" })
      .datetime("Last updated must be a valid ISO datetime")
      .default(() => new Date().toISOString()),
  })
  .passthrough(); // Allow unknown fields for future compatibility
