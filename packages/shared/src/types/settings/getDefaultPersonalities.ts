import type { PersistedPersonalityData } from "./PersistedPersonalityData";
import { persistedPersonalitiesSettingsSchema } from "./personalitiesSettingsSchema";
import defaultPersonalitiesData from "../../data/defaultPersonalities.json";

/**
 * Gets the bundled default personalities without wrapper metadata
 * @returns Array of default personality data, or empty array if not available
 */
export function getDefaultPersonalities(): PersistedPersonalityData[] {
  try {
    const validatedData = persistedPersonalitiesSettingsSchema.parse(
      defaultPersonalitiesData,
    );
    return validatedData.personalities;
  } catch (error) {
    console.warn("Failed to validate default personalities:", error);
    return [];
  }
}
