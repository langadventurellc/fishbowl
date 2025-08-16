import { persistedPersonalitiesSettingsSchema } from "./personalitiesSettingsSchema";
import defaultPersonalitiesData from "../../data/defaultPersonalities.json";

/**
 * Validates that the bundled default data matches current schema
 * @returns True if valid, false if invalid or not available
 */
export function validateDefaultPersonalities(): boolean {
  try {
    persistedPersonalitiesSettingsSchema.parse(defaultPersonalitiesData);
    return true;
  } catch (error) {
    console.warn("Default personalities validation failed:", error);
    return false;
  }
}
