import { z } from "zod";
import { persistedLlmModelSchema } from "./llmModelsSchema";

/**
 * Type definition for a single LLM model configuration.
 * Includes model ID, name, and context length.
 */
export type PersistedLlmModelData = z.infer<typeof persistedLlmModelSchema>;
