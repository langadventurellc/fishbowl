import type { AppearanceSettingsFormData } from "../../types/settings/appearanceSettings";
import type { PersistedAppearanceSettingsData } from "@fishbowl-ai/shared";
import { appearanceSettingsSchema } from "@fishbowl-ai/shared";
import { clampNumber } from "../utils/transformers";

/**
 * Maps Appearance Settings from UI form data to persistence format.
 *
 * This function transforms the UI representation of appearance settings into the format
 * expected by the persistence layer. It ensures the fontSize is within the persistence
 * layer's valid range (12-18) and validates the output against the persistence schema.
 *
 * @param uiData - The appearance settings data from the UI form
 * @returns The mapped data ready for persistence
 * @throws {Error} If the mapped data fails validation against the persistence schema
 *
 * @example
 * ```typescript
 * const uiSettings: AppearanceSettingsFormData = {
 *   theme: 'dark',
 *   showTimestamps: 'hover',
 *   showActivityTime: true,
 *   compactList: false,
 *   fontSize: 16,
 *   messageSpacing: 'normal'
 * };
 *
 * const persistedSettings = mapAppearanceSettingsUIToPersistence(uiSettings);
 * // Returns: PersistedAppearanceSettingsData with validated values
 * ```
 */
export function mapAppearanceSettingsUIToPersistence(
  uiData: AppearanceSettingsFormData,
): PersistedAppearanceSettingsData {
  // Apply clamping to ensure fontSize is within persistence layer's valid range (12-18)
  const mapped: PersistedAppearanceSettingsData = {
    theme: uiData.theme,
    showTimestamps: uiData.showTimestamps,
    showActivityTime: uiData.showActivityTime,
    compactList: uiData.compactList,
    fontSize: clampNumber(uiData.fontSize, 12, 18),
    messageSpacing: uiData.messageSpacing,
  };

  // Validate the mapped data against the schema
  const result = appearanceSettingsSchema.safeParse(mapped);
  if (!result.success) {
    throw new Error(
      `Invalid appearance settings data: ${result.error.message}`,
    );
  }

  return result.data;
}
