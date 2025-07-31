import type { PersistedSettings } from "./PersistedSettings";
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
export const createDefaultPersistedSettings = (): PersistedSettings => ({
  schemaVersion: CURRENT_SCHEMA_VERSION,
  general: createDefaultGeneralSettings(),
  appearance: createDefaultAppearanceSettings(),
  advanced: createDefaultAdvancedSettings(),
  lastUpdated: new Date().toISOString(),
});
