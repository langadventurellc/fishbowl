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

    // Role identifier
    role: z
      .string({ message: "Role must be a string" })
      .min(1, "Role is required"),

    // Personality identifier
    personality: z
      .string({ message: "Personality must be a string" })
      .min(1, "Personality is required"),

    // Temperature setting (0-2)
    temperature: z
      .number({ message: "Temperature must be a number" })
      .min(0, "Temperature must be at least 0")
      .max(2, "Temperature cannot exceed 2"),

    // Maximum tokens setting (1-4000)
    maxTokens: z
      .number({ message: "Max tokens must be a number" })
      .min(1, "Max tokens must be at least 1")
      .max(4000, "Max tokens cannot exceed 4000")
      .int("Max tokens must be an integer"),

    // Top P setting (0-1)
    topP: z
      .number({ message: "Top P must be a number" })
      .min(0, "Top P must be at least 0")
      .max(1, "Top P cannot exceed 1"),

    // Optional system prompt
    systemPrompt: z
      .string({ message: "System prompt must be a string" })
      .max(5000, "System prompt cannot exceed 5000 characters")
      .optional(),

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
