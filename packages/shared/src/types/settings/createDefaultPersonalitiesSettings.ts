import type { PersistedPersonalitiesSettingsData } from "./PersistedPersonalitiesSettingsData";
import type { PersistedPersonalityData } from "./PersistedPersonalityData";
import { persistedPersonalitiesSettingsSchema } from "./personalitiesSettingsSchema";
import defaultPersonalitiesData from "../../data/defaultPersonalities.json";

/**
 * Creates the default personalities settings structure
 * @param includeDefaults - Whether to include the bundled default personalities (default: true)
 * @returns Default personalities settings with optional default personalities
 */
export function createDefaultPersonalitiesSettings(
  includeDefaults: boolean = true,
): PersistedPersonalitiesSettingsData {
  let personalities: PersistedPersonalityData[] = [];

  if (includeDefaults) {
    try {
      // Validate the default data against current schema
      const validatedData = persistedPersonalitiesSettingsSchema.parse(
        defaultPersonalitiesData,
      );
      personalities = validatedData.personalities;
    } catch (error) {
      console.warn(
        "Default personalities data validation failed, using empty array:",
        error,
      );
      personalities = [];
    }
  }

  return {
    schemaVersion: "1.0.0",
    personalities,
    lastUpdated: new Date().toISOString(),
  };
}
