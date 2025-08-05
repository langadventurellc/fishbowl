/**
 * Type inference for LLM provider configuration schema.
 *
 * @fileoverview Inferred TypeScript type from LlmProviderConfigurationSchema
 * @module types/llm-providers/validation/InferredLlmProviderConfiguration
 */

import { z } from "zod";
import { LlmProviderConfigurationSchema } from "./LlmProviderConfigurationSchema";

/**
 * Inferred TypeScript type from LlmProviderConfigurationSchema.
 * Provides compile-time type safety for provider configuration validation.
 */
export type InferredLlmProviderConfiguration = z.infer<
  typeof LlmProviderConfigurationSchema
>;
