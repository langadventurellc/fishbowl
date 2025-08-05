/**
 * Type inference for LLM providers file schema.
 *
 * @fileoverview Inferred TypeScript type from LlmProvidersFileSchema
 * @module types/llm-providers/validation/InferredLlmProvidersFile
 */

import { z } from "zod";
import { LlmProvidersFileSchema } from "./file.schema";

/**
 * Inferred TypeScript type from LlmProvidersFileSchema.
 * Provides compile-time type safety for file validation.
 */
export type InferredLlmProvidersFile = z.infer<typeof LlmProvidersFileSchema>;
