/**
 * Schema for provider metadata including optional capabilities.
 *
 * @fileoverview Zod schema for LLM provider metadata validation
 * @module types/llm-providers/validation/LlmProviderMetadataSchema
 */

import { z } from "zod";

/**
 * Schema for provider metadata including optional capabilities.
 * Validates provider display information and feature support.
 */
export const LlmProviderMetadataSchema = z.object({
  id: z
    .string()
    .min(1, "Provider ID is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Provider ID must be lowercase alphanumeric with hyphens",
    ),
  name: z.string().min(1, "Provider name is required"),
  models: z
    .record(z.string(), z.string())
    .refine(
      (models) => Object.keys(models).length > 0,
      "At least one model must be defined",
    ),
  // Optional metadata fields for future extensibility
  displayName: z.string().min(1).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  capabilities: z
    .object({
      supportsChatCompletion: z.boolean().optional(),
      supportsStreaming: z.boolean().optional(),
      supportsCustomInstructions: z.boolean().optional(),
      supportsFunctionCalling: z.boolean().optional(),
    })
    .optional(),
});
