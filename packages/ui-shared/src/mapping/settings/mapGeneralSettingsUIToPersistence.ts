import type { GeneralSettingsFormData } from "../../types/settings/generalSettings";
import type { PersistedGeneralSettingsData } from "@fishbowl-ai/shared";
import { generalSettingsSchema } from "@fishbowl-ai/shared";
import { clampNumber } from "../utils/transformers";

/**
 * Maps General Settings from UI form data to persistence format.
 *
 * This function transforms the UI representation of general settings into the format
 * expected by the persistence layer. It ensures all numeric values are within valid
 * ranges and validates the output against the persistence schema.
 *
 * @param uiData - The general settings data from the UI form
 * @returns The mapped data ready for persistence
 * @throws {Error} If the mapped data fails validation against the persistence schema
 *
 * @example
 * ```typescript
 * const uiSettings: GeneralSettingsFormData = {
 *   responseDelay: 2000,
 *   maximumMessages: 100,
 *   maximumWaitTime: 30000,
 *   defaultMode: 'manual',
 *   maximumAgents: 4,
 *   checkUpdates: true
 * };
 *
 * const persistedSettings = mapGeneralSettingsUIToPersistence(uiSettings);
 * // Returns: PersistedGeneralSettingsData with validated values
 * ```
 */
export function mapGeneralSettingsUIToPersistence(
  uiData: GeneralSettingsFormData,
): PersistedGeneralSettingsData {
  // Apply clamping to ensure values are within valid ranges
  const mapped: PersistedGeneralSettingsData = {
    responseDelay: clampNumber(uiData.responseDelay, 1000, 30000),
    maximumMessages: clampNumber(uiData.maximumMessages, 0, 500),
    maximumWaitTime: clampNumber(uiData.maximumWaitTime, 5000, 120000),
    defaultMode: uiData.defaultMode,
    maximumAgents: clampNumber(uiData.maximumAgents, 1, 8),
    checkUpdates: uiData.checkUpdates,
  };

  // Validate the mapped data against the schema
  const result = generalSettingsSchema.safeParse(mapped);
  if (!result.success) {
    throw new Error(`Invalid general settings data: ${result.error.message}`);
  }

  return result.data;
}
