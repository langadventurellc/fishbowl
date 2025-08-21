import { z } from "zod";

/**
 * Schema version constant for LLM models configuration.
 * Used for schema evolution and migration support.
 */
export const LLM_MODELS_SCHEMA_VERSION = "1.0.0";

/**
 * Current schema version alias for consistency with application patterns.
 */
export const CURRENT_LLM_MODELS_SCHEMA_VERSION = LLM_MODELS_SCHEMA_VERSION;

/**
 * Zod schema for validating persisted LLM model data.
 *
 * Features:
 * - Comprehensive validation with security limits
 * - Clear error messages for validation failures
 * - Context length validation for reasonable values
 * - No sensitive data exposure in validation errors
 * - Character limits to prevent DoS attacks
 */
export const persistedLlmModelSchema = z
  .object({
    // Unique identifier - required, non-empty string
    id: z
      .string({ message: "Model ID must be a string" })
      .min(1, "Model ID cannot be empty")
      .max(100, "Model ID cannot exceed 100 characters"),

    // Display name with character limits
    name: z
      .string({ message: "Model name must be a string" })
      .min(1, "Model name is required")
      .max(100, "Model name cannot exceed 100 characters"),

    // Context window size in tokens - reasonable range for LLM models
    contextLength: z
      .number({ message: "Context length must be a number" })
      .int("Context length must be an integer")
      .min(1000, "Context length must be at least 1,000 tokens")
      .max(10000000, "Context length cannot exceed 10,000,000 tokens"),
  })
  .passthrough(); // Allow unknown fields for schema evolution

/**
 * Zod schema for validating persisted LLM provider data.
 *
 * Features:
 * - Provider metadata validation
 * - Array of validated model objects
 * - Security-conscious string length limits
 * - Clear error messages for validation failures
 */
export const persistedLlmProviderSchema = z
  .object({
    // Unique identifier - required, non-empty string
    id: z
      .string({ message: "Provider ID must be a string" })
      .min(1, "Provider ID cannot be empty")
      .max(50, "Provider ID cannot exceed 50 characters"),

    // Display name with character limits
    name: z
      .string({ message: "Provider name must be a string" })
      .min(1, "Provider name is required")
      .max(100, "Provider name cannot exceed 100 characters"),

    // Array of model configurations
    models: z
      .array(persistedLlmModelSchema, {
        message: "Models must be an array of model objects",
      })
      .min(1, "Provider must have at least one model")
      .max(50, "Provider cannot have more than 50 models"),
  })
  .passthrough(); // Allow unknown fields for schema evolution

/**
 * Master Zod schema for validating complete LLM models settings file.
 *
 * Features:
 * - Schema versioning for migration support
 * - Array of validated provider objects
 * - Automatic timestamp generation
 * - Schema evolution support with .passthrough()
 * - Clear error messages for validation failures
 * - Security validation to prevent DoS attacks
 */
export const persistedLlmModelsSettingsSchema = z
  .object({
    // Schema versioning for migration support
    schemaVersion: z
      .string({ message: "Schema version must be a string" })
      .min(1, "Schema version cannot be empty")
      .default(CURRENT_LLM_MODELS_SCHEMA_VERSION),

    // Array of provider configurations
    providers: z
      .array(persistedLlmProviderSchema, {
        message: "Providers must be an array of provider objects",
      })
      .min(1, "Configuration must have at least one provider")
      .max(20, "Configuration cannot have more than 20 providers")
      .default([]),

    // Metadata with automatic generation
    lastUpdated: z
      .string({ message: "Last updated must be an ISO timestamp string" })
      .datetime("Last updated must be a valid ISO datetime")
      .default(() => new Date().toISOString()),
  })
  .passthrough(); // Allow unknown fields for future compatibility
