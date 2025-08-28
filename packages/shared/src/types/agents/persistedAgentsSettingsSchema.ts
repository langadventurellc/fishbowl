import { z } from "zod";

/**
 * Schema version constant for agents configuration.
 * Used for schema evolution and migration support.
 */
export const AGENTS_SCHEMA_VERSION = "1.0.0";

/**
 * Current schema version alias for consistency with application patterns.
 */
export const CURRENT_AGENTS_SCHEMA_VERSION = AGENTS_SCHEMA_VERSION;

/**
 * Zod schema for validating personality behavior configuration.
 *
 * Features:
 * - All behavior properties are optional for flexibility
 * - Numeric values representing behavior traits (-100 to 100 range)
 * - Supports both existing and new personality behaviors
 * - Clear validation messages for debugging
 */
export const PersonalityBehaviorsSchema = z
  .object({
    // Existing personality behaviors
    humor: z
      .number({ message: "Humor must be a number" })
      .min(-100, "Humor must be between -100 and 100")
      .max(100, "Humor must be between -100 and 100")
      .optional(),
    formality: z
      .number({ message: "Formality must be a number" })
      .min(-100, "Formality must be between -100 and 100")
      .max(100, "Formality must be between -100 and 100")
      .optional(),
    brevity: z
      .number({ message: "Brevity must be a number" })
      .min(-100, "Brevity must be between -100 and 100")
      .max(100, "Brevity must be between -100 and 100")
      .optional(),
    assertiveness: z
      .number({ message: "Assertiveness must be a number" })
      .min(-100, "Assertiveness must be between -100 and 100")
      .max(100, "Assertiveness must be between -100 and 100")
      .optional(),

    // New personality behaviors
    responseLength: z
      .number({ message: "Response length must be a number" })
      .min(-100, "Response length must be between -100 and 100")
      .max(100, "Response length must be between -100 and 100")
      .optional(),
    randomness: z
      .number({ message: "Randomness must be a number" })
      .min(-100, "Randomness must be between -100 and 100")
      .max(100, "Randomness must be between -100 and 100")
      .optional(),
    focus: z
      .number({ message: "Focus must be a number" })
      .min(-100, "Focus must be between -100 and 100")
      .max(100, "Focus must be between -100 and 100")
      .optional(),
  })
  .optional();

/**
 * Zod schema for validating persisted agent data.
 *
 * Features:
 * - Comprehensive validation with security limits
 * - Clear error messages for validation failures
 * - Nullable timestamps for manual JSON editing
 * - No sensitive data exposure in validation errors
 * - Character limits to prevent DoS attacks
 */
export const persistedAgentSchema = z
  .object({
    // Unique identifier - required, non-empty string
    id: z
      .string({ message: "Agent ID must be a string" })
      .min(1, "Agent ID cannot be empty"),

    // Display name with character limits
    name: z
      .string({ message: "Agent name must be a string" })
      .min(1, "Agent name is required")
      .max(100, "Agent name cannot exceed 100 characters"),

    // LLM model identifier
    model: z
      .string({ message: "Model must be a string" })
      .min(1, "Model is required"),

    // LLM configuration identifier - OPTIONAL initially for gradual migration
    llmConfigId: z
      .string({ message: "LLM Configuration ID must be a string" })
      .min(1, "LLM Configuration ID is required")
      .optional(), // Will be made required in later task after UI support

    // Role identifier
    role: z
      .string({ message: "Role must be a string" })
      .min(1, "Role is required"),

    // Personality identifier
    personality: z
      .string({ message: "Personality must be a string" })
      .min(1, "Personality is required"),

    // Optional system prompt
    systemPrompt: z
      .string({ message: "System prompt must be a string" })
      .max(5000, "System prompt cannot exceed 5000 characters")
      .optional(),

    // Optional personality behaviors configuration
    personalityBehaviors: PersonalityBehaviorsSchema,

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
  .passthrough(); // Allow unknown fields for schema evolution; // Allow unknown fields for schema evolution

/**
 * Master Zod schema for validating complete agents settings file.
 *
 * Features:
 * - Schema versioning for migration support
 * - Array of validated agent objects
 * - Automatic timestamp generation
 * - Schema evolution support with .passthrough()
 * - Clear error messages for validation failures
 */
export const persistedAgentsSettingsSchema = z
  .object({
    // Schema versioning for migration support
    schemaVersion: z
      .string({ message: "Schema version must be a string" })
      .min(1, "Schema version cannot be empty")
      .default(CURRENT_AGENTS_SCHEMA_VERSION),

    // Array of agent configurations
    agents: z
      .array(persistedAgentSchema, {
        message: "Agents must be an array of agent objects",
      })
      .default([]),

    // Metadata with automatic generation
    lastUpdated: z
      .string({ message: "Last updated must be an ISO timestamp string" })
      .datetime("Last updated must be a valid ISO datetime")
      .default(() => new Date().toISOString()),
  })
  .passthrough(); // Allow unknown fields for future compatibility
