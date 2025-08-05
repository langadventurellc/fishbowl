/**
 * Type inference for LlmFieldConfig schema.
 *
 * @fileoverview Inferred type to verify compatibility with LlmFieldConfig interface
 * @module types/llm-providers/validation/InferredLlmFieldConfig
 */

import { z } from "zod";
import { LlmFieldConfigSchema } from "./LlmFieldConfigSchema";

/**
 * Inferred type from LlmFieldConfigSchema to verify compatibility with LlmFieldConfig interface.
 */
export type InferredLlmFieldConfig = z.infer<typeof LlmFieldConfigSchema>;
