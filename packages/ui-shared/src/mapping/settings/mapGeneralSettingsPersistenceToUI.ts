import type { GeneralSettingsFormData } from "../../types/settings/generalSettings";
import type { PersistedGeneralSettingsData } from "@fishbowl-ai/shared";
import { defaultGeneralSettings } from "../../types/settings/generalSettings";
import { applyDefaults } from "../utils/defaults";
import { coerceBoolean, clampNumber } from "../utils/transformers";

/**
 * Maps General Settings from persistence format to UI form data.
 *
 * This function transforms persisted general settings into the format expected
 * by the UI forms. It applies defaults for any missing fields and ensures all
 * values are properly typed and within valid ranges.
 *
 * @param persistedData - The general settings data from persistence
 * @returns The mapped data ready for UI forms
 *
 * @example
 * ```typescript
 * const persistedSettings: PersistedGeneralSettingsData = {
 *   responseDelay: 3000,
 *   maximumMessages: 200,
 *   maximumWaitTime: 45000,
 *   defaultMode: 'auto',
 *   maximumAgents: 6,
 *   checkUpdates: false
 * };
 *
 * const uiSettings = mapGeneralSettingsPersistenceToUI(persistedSettings);
 * // Returns: GeneralSettingsFormData with all fields properly mapped
 * ```
 *
 * @example
 * ```typescript
 * // With partial data (missing fields will use defaults)
 * const partialSettings: Partial<PersistedGeneralSettingsData> = {
 *   responseDelay: 5000,
 *   defaultMode: 'auto'
 * };
 *
 * const uiSettings = mapGeneralSettingsPersistenceToUI(partialSettings as PersistedGeneralSettingsData);
 * // Returns: GeneralSettingsFormData with provided values and defaults for missing fields
 * ```
 */
export function mapGeneralSettingsPersistenceToUI(
  persistedData: PersistedGeneralSettingsData,
): GeneralSettingsFormData {
  // Transform the data with validation and coercion, only including defined and non-null values
  const transformed: Partial<GeneralSettingsFormData> = {};

  if (
    persistedData.responseDelay !== undefined &&
    persistedData.responseDelay !== null
  ) {
    transformed.responseDelay = clampNumber(
      persistedData.responseDelay,
      1000,
      30000,
    );
  }

  if (
    persistedData.maximumMessages !== undefined &&
    persistedData.maximumMessages !== null
  ) {
    transformed.maximumMessages = clampNumber(
      persistedData.maximumMessages,
      0,
      500,
    );
  }

  if (
    persistedData.maximumWaitTime !== undefined &&
    persistedData.maximumWaitTime !== null
  ) {
    transformed.maximumWaitTime = clampNumber(
      persistedData.maximumWaitTime,
      5000,
      120000,
    );
  }

  if (
    persistedData.defaultMode !== undefined &&
    persistedData.defaultMode !== null
  ) {
    transformed.defaultMode = persistedData.defaultMode;
  }

  if (
    persistedData.maximumAgents !== undefined &&
    persistedData.maximumAgents !== null
  ) {
    transformed.maximumAgents = clampNumber(persistedData.maximumAgents, 1, 8);
  }

  if (
    persistedData.checkUpdates !== undefined &&
    persistedData.checkUpdates !== null
  ) {
    transformed.checkUpdates = coerceBoolean(persistedData.checkUpdates);
  }

  // Apply defaults for missing fields
  return applyDefaults(transformed, defaultGeneralSettings);
}
