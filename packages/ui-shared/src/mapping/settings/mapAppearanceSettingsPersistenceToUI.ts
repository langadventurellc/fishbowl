import type { AppearanceSettingsFormData } from "../../types/settings/appearanceSettings";
import type { PersistedAppearanceSettingsData } from "@fishbowl-ai/shared";
import {
  THEME_MODES,
  SHOW_TIMESTAMPS_OPTIONS,
  MESSAGE_SPACING_OPTIONS,
} from "@fishbowl-ai/shared";
import { defaultAppearanceSettings } from "../../types/settings/appearanceSettings";
import { applyDefaults } from "../utils/defaults";
import {
  coerceBoolean,
  clampNumber,
  normalizeEnum,
} from "../utils/transformers";

/**
 * Maps Appearance Settings from persistence format to UI form data.
 *
 * This function transforms persisted appearance settings into the format expected
 * by the UI forms. It applies defaults for any missing fields, normalizes enum values,
 * and ensures all values are properly typed and within valid ranges.
 *
 * @param persistedData - The appearance settings data from persistence (can be null/undefined)
 * @returns The mapped data ready for UI forms
 *
 * @example
 * ```typescript
 * const persistedSettings: PersistedAppearanceSettingsData = {
 *   theme: 'dark',
 *   showTimestamps: 'hover',
 *   showActivityTime: true,
 *   compactList: false,
 *   fontSize: 16,
 *   messageSpacing: 'normal'
 * };
 *
 * const uiSettings = mapAppearanceSettingsPersistenceToUI(persistedSettings);
 * // Returns: AppearanceSettingsFormData with all fields properly mapped
 * ```
 *
 * @example
 * ```typescript
 * // With null/undefined input (uses defaults)
 * const uiSettings = mapAppearanceSettingsPersistenceToUI(null);
 * // Returns: AppearanceSettingsFormData with all default values
 * ```
 *
 * @example
 * ```typescript
 * // With partial data (missing fields will use defaults)
 * const partialSettings: Partial<PersistedAppearanceSettingsData> = {
 *   theme: 'light',
 *   fontSize: 18
 * };
 *
 * const uiSettings = mapAppearanceSettingsPersistenceToUI(partialSettings as PersistedAppearanceSettingsData);
 * // Returns: AppearanceSettingsFormData with provided values and defaults for missing fields
 * ```
 */
export function mapAppearanceSettingsPersistenceToUI(
  persistedData: PersistedAppearanceSettingsData | null | undefined,
): AppearanceSettingsFormData {
  // Handle null/undefined input by returning defaults
  if (!persistedData) {
    return { ...defaultAppearanceSettings };
  }

  // Transform the data with validation and coercion, only including defined and non-null values
  const transformed: Partial<AppearanceSettingsFormData> = {};

  // Theme with enum normalization
  if (persistedData.theme !== undefined && persistedData.theme !== null) {
    transformed.theme = normalizeEnum(
      persistedData.theme,
      THEME_MODES,
      defaultAppearanceSettings.theme,
    );
  }

  // Show timestamps with enum normalization
  if (
    persistedData.showTimestamps !== undefined &&
    persistedData.showTimestamps !== null
  ) {
    transformed.showTimestamps = normalizeEnum(
      persistedData.showTimestamps,
      SHOW_TIMESTAMPS_OPTIONS,
      defaultAppearanceSettings.showTimestamps,
    );
  }

  // Show activity time with boolean coercion
  if (
    persistedData.showActivityTime !== undefined &&
    persistedData.showActivityTime !== null
  ) {
    transformed.showActivityTime = coerceBoolean(
      persistedData.showActivityTime,
    );
  }

  // Compact list with boolean coercion
  if (
    persistedData.compactList !== undefined &&
    persistedData.compactList !== null
  ) {
    transformed.compactList = coerceBoolean(persistedData.compactList);
  }

  // Font size with clamping (UI allows 12-20, but persistence stores 12-18)
  if (persistedData.fontSize !== undefined && persistedData.fontSize !== null) {
    // Ensure it's a valid number before clamping
    if (
      typeof persistedData.fontSize === "number" &&
      !Number.isNaN(persistedData.fontSize)
    ) {
      transformed.fontSize = clampNumber(persistedData.fontSize, 12, 20);
    } else {
      // If not a valid number, use default
      transformed.fontSize = defaultAppearanceSettings.fontSize;
    }
  }

  // Message spacing with enum normalization
  if (
    persistedData.messageSpacing !== undefined &&
    persistedData.messageSpacing !== null
  ) {
    transformed.messageSpacing = normalizeEnum(
      persistedData.messageSpacing,
      MESSAGE_SPACING_OPTIONS,
      defaultAppearanceSettings.messageSpacing,
    );
  }

  // Apply defaults for missing fields
  return applyDefaults(transformed, defaultAppearanceSettings);
}
