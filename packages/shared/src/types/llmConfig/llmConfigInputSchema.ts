import { z } from "zod";

/**
 * Zod schema for validating LLM configuration input data.
 * Used when creating or updating configurations.
 */
export const llmConfigInputSchema = z
  .object({
    customName: z
      .string({ message: "Custom name must be a string" })
      .min(1, "Custom name is required")
      .max(100, "Custom name cannot exceed 100 characters"),

    provider: z
      .string({ message: "Provider must be a string" })
      .min(1, "Provider is required")
      .max(50, "Provider cannot exceed 50 characters"),

    apiKey: z
      .string({ message: "API key must be a string" })
      .min(1, "API key is required")
      .max(500, "API key cannot exceed 500 characters"),

    baseUrl: z
      .string({ message: "Base URL must be a string" })
      .url("Base URL must be a valid URL")
      .optional(),

    authHeaderType: z
      .string({ message: "Auth header type must be a string" })
      .max(50, "Auth header type cannot exceed 50 characters")
      .optional(),
  })
  .passthrough(); // Allow unknown fields for schema evolution
