/**
 * Type inference for complete LLM provider schema.
 *
 * @fileoverview Inferred TypeScript type from LlmProviderConfigSchema
 * @module types/llm-providers/validation/InferredLlmProviderConfig
 */

import { z } from "zod";
import { LlmProviderConfigSchema } from "./LlmProviderConfigSchema";

/**
 * Inferred TypeScript type from LlmProviderConfigSchema.
 * Provides compile-time type safety for complete provider validation.
 */
export type InferredLlmProviderConfig = z.infer<typeof LlmProviderConfigSchema>;
