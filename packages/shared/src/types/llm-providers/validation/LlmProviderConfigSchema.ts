/**
 * Complete provider configuration schema with business rule refinements.
 *
 * @fileoverview Zod schema for complete LLM provider definition validation
 * @module types/llm-providers/validation/LlmProviderConfigSchema
 */

import { z } from "zod";
import { LlmProviderConfigurationSchema } from "./LlmProviderConfigurationSchema";
import { LlmProviderMetadataSchema } from "./LlmProviderMetadataSchema";

/**
 * Complete provider configuration schema with business rule refinements.
 * Validates the entire provider definition including cross-field rules.
 */
export const LlmProviderConfigSchema = z
  .object({
    id: z
      .string()
      .min(1, "Provider ID is required")
      .regex(
        /^[a-z0-9-]+$/,
        "Provider ID must be lowercase alphanumeric with hyphens",
      ),
    name: z.string().min(1, "Provider name is required"),
    models: z.record(z.string(), z.string()),
    configuration: LlmProviderConfigurationSchema,
    metadata: LlmProviderMetadataSchema.optional(),
  })
  .refine(
    (data) => {
      // Business rule: At least one model must be defined
      return Object.keys(data.models).length > 0;
    },
    {
      message: "At least one model must be defined",
      path: ["models"],
    },
  )
  .refine(
    (data) => {
      // Business rule: Field IDs must be unique within a provider
      const fieldIds = data.configuration.fields.map((field) => field.id);
      const uniqueFieldIds = new Set(fieldIds);
      return fieldIds.length === uniqueFieldIds.size;
    },
    {
      message: "Field IDs must be unique within a provider",
      path: ["configuration", "fields"],
    },
  );
