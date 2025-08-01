import type { PersistedSettingsData } from "./PersistedSettingsData";
import { createDefaultAdvancedSettings } from "./createDefaultAdvancedSettings";
import { createDefaultAppearanceSettings } from "./createDefaultAppearanceSettings";
import { createDefaultGeneralSettings } from "./createDefaultGeneralSettings";
import { CURRENT_SCHEMA_VERSION } from "./persistedSettingsSchema";

/**
 * Creates complete default settings with all categories and metadata.
 *
 * Combines individual category defaults into the master settings structure
 * with current schema version and timestamp.
 */
export const createDefaultPersistedSettings = (): PersistedSettingsData => {
  const settings = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    general: createDefaultGeneralSettings(),
    appearance: createDefaultAppearanceSettings(),
    advanced: createDefaultAdvancedSettings(),
    lastUpdated: new Date().toISOString(),
  };

  // Type assertion to satisfy the Zod-inferred type with index signature
  return settings as PersistedSettingsData;
};
