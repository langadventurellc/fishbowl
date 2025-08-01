import type { AdvancedSettingsFormData } from "../../types/settings/advancedSettings";
import type { PersistedAdvancedSettingsData } from "@fishbowl-ai/shared";
import { advancedSettingsSchema } from "@fishbowl-ai/shared";
import { coerceBoolean } from "../utils/transformers";

/**
 * Maps Advanced Settings from UI form data to persistence format.
 *
 * This function transforms the UI representation of advanced settings into the format
 * expected by the persistence layer. It handles field name mapping (debugLogging → debugMode)
 * and ensures all boolean values are properly coerced with security-focused defaults.
 *
 * @param uiData - The advanced settings data from the UI form
 * @returns The mapped data ready for persistence
 * @throws {Error} If the mapped data fails validation against the persistence schema
 * @security All developer options default to false for security when invalid
 *
 * @example
 * ```typescript
 * const uiSettings: AdvancedSettingsFormData = {
 *   debugLogging: true,
 *   experimentalFeatures: false
 * };
 *
 * const persistedSettings = mapAdvancedSettingsUIToPersistence(uiSettings);
 * // Returns: { debugMode: true, experimentalFeatures: false }
 * ```
 */
export function mapAdvancedSettingsUIToPersistence(
  uiData: AdvancedSettingsFormData,
): PersistedAdvancedSettingsData {
  // Map UI fields to persistence format with field name transformation
  const mapped: PersistedAdvancedSettingsData = {
    debugMode: coerceBoolean(uiData.debugLogging),
    experimentalFeatures: coerceBoolean(uiData.experimentalFeatures),
  };

  // Validate the mapped data against the schema
  const result = advancedSettingsSchema.safeParse(mapped);
  if (!result.success) {
    throw new Error(`Invalid advanced settings data: ${result.error.message}`);
  }

  return result.data;
}
