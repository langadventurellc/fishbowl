/**
 * Type inference for LLM provider metadata schema.
 *
 * @fileoverview Inferred TypeScript type from LlmProviderMetadataSchema
 * @module types/llm-providers/validation/InferredLlmProviderMetadata
 */

import { z } from "zod";
import { LlmProviderMetadataSchema } from "./LlmProviderMetadataSchema";

/**
 * Inferred TypeScript type from LlmProviderMetadataSchema.
 * Provides compile-time type safety for provider metadata validation.
 */
export type InferredLlmProviderMetadata = z.infer<
  typeof LlmProviderMetadataSchema
>;
