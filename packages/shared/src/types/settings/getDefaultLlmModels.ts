import type { PersistedLlmProviderData } from "./PersistedLlmProviderData";
import { persistedLlmModelsSettingsSchema } from "./llmModelsSchema";
import defaultLlmModelsData from "../../data/defaultLlmModels.json";

/**
 * Gets the bundled default LLM models without wrapper metadata
 * @returns Array of default provider data, or empty array if not available
 */
export function getDefaultLlmModels(): PersistedLlmProviderData[] {
  try {
    const validatedData =
      persistedLlmModelsSettingsSchema.parse(defaultLlmModelsData);
    return validatedData.providers;
  } catch (error) {
    console.warn("Failed to validate default LLM models:", error);
    return [];
  }
}
