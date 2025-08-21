import { z } from "zod";
import { persistedLlmProviderSchema } from "./llmModelsSchema";

/**
 * Type definition for a single LLM provider configuration.
 * Includes provider metadata and array of models.
 */
export type PersistedLlmProviderData = z.infer<
  typeof persistedLlmProviderSchema
>;
