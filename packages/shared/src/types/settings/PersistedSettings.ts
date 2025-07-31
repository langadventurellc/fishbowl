import type { PersistedAdvancedSettings } from "./PersistedAdvancedSettings";
import type { PersistedAppearanceSettings } from "./PersistedAppearanceSettings";
import type { PersistedGeneralSettings } from "./PersistedGeneralSettings";

/**
 * Master interface combining all settings categories for JSON persistence.
 *
 * This interface is designed for JSON serialization/deserialization with:
 * - Schema versioning for future migrations
 * - Flat structure combining all settings categories
 * - Metadata tracking (timestamps, version)
 * - Complete settings state for persistence layer
 * - Optimized for storage in preferences.json file
 */
export interface PersistedSettings {
  // Schema versioning for future migrations
  schemaVersion: string;

  // Settings categories
  general: PersistedGeneralSettings;
  appearance: PersistedAppearanceSettings;
  advanced: PersistedAdvancedSettings;

  // Metadata
  lastUpdated: string; // ISO timestamp
}
