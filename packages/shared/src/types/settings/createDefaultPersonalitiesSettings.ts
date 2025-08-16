import type { PersistedPersonalitiesSettingsData } from "./PersistedPersonalitiesSettingsData";

/**
 * Creates the default personalities settings structure
 * Used for initial file creation and reset operations
 * @returns Default personalities settings with empty personalities array
 */
export function createDefaultPersonalitiesSettings(): PersistedPersonalitiesSettingsData {
  return {
    schemaVersion: "1.0.0",
    personalities: [],
    lastUpdated: new Date().toISOString(),
  };
}
