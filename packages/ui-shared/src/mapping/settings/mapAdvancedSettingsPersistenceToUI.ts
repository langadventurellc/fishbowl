import type { PersistedAdvancedSettingsData } from "@fishbowl-ai/shared";
import type { AdvancedSettingsFormData } from "../../types/settings/advancedSettings";
import { defaultAdvancedSettings } from "../../types/settings/advancedSettings";
import { applyDefaults } from "../utils/defaults";
import { coerceBoolean } from "../utils/transformers";

/**
 * Maps Advanced Settings from persistence format to UI form data.
 *
 * This function transforms persisted advanced settings into the format expected
 * by the UI forms. It applies defaults for any missing fields, handles field name
 * mapping (debugLogging → debugLogging), and ensures all boolean values are properly
 * coerced with security-focused defaults.
 *
 * @param persistedData - The advanced settings data from persistence
 * @returns The mapped data ready for UI forms
 *
 * @example
 * ```typescript
 * const persistedSettings: PersistedAdvancedSettingsData = {
 *   debugLogging: true,
 *   experimentalFeatures: false
 * };
 *
 * const uiSettings = mapAdvancedSettingsPersistenceToUI(persistedSettings);
 * // Returns: { debugLogging: true, experimentalFeatures: false }
 * ```
 *
 * @example
 * ```typescript
 * // With partial data (missing fields will use defaults)
 * const partialSettings: Partial<PersistedAdvancedSettingsData> = {
 *   debugLogging: true
 * };
 *
 * const uiSettings = mapAdvancedSettingsPersistenceToUI(partialSettings as PersistedAdvancedSettingsData);
 * // Returns: { debugLogging: true, experimentalFeatures: false }
 * ```
 */
export function mapAdvancedSettingsPersistenceToUI(
  persistedData: PersistedAdvancedSettingsData,
): AdvancedSettingsFormData {
  // Transform the data with validation and coercion, only including defined and non-null values
  const transformed: Partial<AdvancedSettingsFormData> = {};

  // Map debugLogging to debugLogging with boolean coercion
  if (
    persistedData.debugLogging !== undefined &&
    persistedData.debugLogging !== null
  ) {
    transformed.debugLogging = coerceBoolean(persistedData.debugLogging);
  }

  // Map experimentalFeatures directly with boolean coercion
  if (
    persistedData.experimentalFeatures !== undefined &&
    persistedData.experimentalFeatures !== null
  ) {
    transformed.experimentalFeatures = coerceBoolean(
      persistedData.experimentalFeatures,
    );
  }

  // Apply defaults for missing fields
  return applyDefaults(transformed, defaultAdvancedSettings);
}
