import { z } from "zod";
import { persistedLlmModelsSettingsSchema } from "./llmModelsSchema";

/**
 * Type definition for the complete LLM models settings file structure.
 * Includes schema version, providers array, and metadata.
 */
export type PersistedLlmModelsSettingsData = z.infer<
  typeof persistedLlmModelsSettingsSchema
>;
