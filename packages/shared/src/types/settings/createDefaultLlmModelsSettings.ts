import type { PersistedLlmModelsSettingsData } from "./PersistedLlmModelsSettingsData";
import type { PersistedLlmProviderData } from "./PersistedLlmProviderData";
import { persistedLlmModelsSettingsSchema } from "./llmModelsSchema";
import defaultLlmModelsData from "../../data/defaultLlmModels.json";

/**
 * Creates the default LLM models settings structure
 * @param includeDefaults - Whether to include the bundled default models (default: true)
 * @returns Default LLM models settings with optional default models
 */
export function createDefaultLlmModelsSettings(
  includeDefaults: boolean = true,
): PersistedLlmModelsSettingsData {
  let providers: PersistedLlmProviderData[] = [];

  if (includeDefaults) {
    try {
      // Validate the default data against current schema
      const validatedData =
        persistedLlmModelsSettingsSchema.parse(defaultLlmModelsData);
      providers = validatedData.providers;
    } catch (error) {
      console.warn(
        "Default LLM models data validation failed, using empty array:",
        error,
      );
      providers = [];
    }
  }

  return {
    schemaVersion: "1.0.0",
    providers,
    lastUpdated: new Date().toISOString(),
  };
}
