/**
 * Schema for provider configuration fields.
 *
 * @fileoverview Zod schema for LLM provider configuration validation
 * @module types/llm-providers/validation/LlmProviderConfigurationSchema
 */

import { z } from "zod";
import { LlmFieldConfigSchema } from "./LlmFieldConfigSchema";

/**
 * Schema for provider configuration fields.
 * Validates the field array structure.
 */
export const LlmProviderConfigurationSchema = z.object({
  fields: z.array(LlmFieldConfigSchema),
});
