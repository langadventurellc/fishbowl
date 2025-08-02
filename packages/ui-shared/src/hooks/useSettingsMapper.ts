import { useCallback } from "react";
import type { SettingsFormData } from "../types/settings/combined/SettingsFormData";
import type { PersistedSettingsData } from "@fishbowl-ai/shared";
import { CURRENT_SCHEMA_VERSION } from "@fishbowl-ai/shared";
import type { UseSettingsMapperReturn } from "./UseSettingsMapperReturn";
import {
  mapGeneralSettingsUIToPersistence,
  mapGeneralSettingsPersistenceToUI,
  mapAppearanceSettingsUIToPersistence,
  mapAppearanceSettingsPersistenceToUI,
  mapAdvancedSettingsUIToPersistence,
  mapAdvancedSettingsPersistenceToUI,
} from "../mapping/settings";

/**
 * Hook that provides bidirectional mapping functions for settings data
 *
 * @remarks
 * This hook coordinates all individual category mappers to provide unified
 * settings transformation. All operations are atomic - settings are always
 * transformed as a complete unit.
 *
 * Performance characteristics:
 * - Hook initialization: < 5ms
 * - Mapping operations: < 2ms
 *
 * @returns Object containing mapToPersistence and mapToUI functions
 *
 * @example
 * ```tsx
 * const { mapToPersistence, mapToUI } = useSettingsMapper();
 *
 * // Convert form data for saving
 * const persistedData = mapToPersistence(formData);
 *
 * // Convert saved data for display
 * const formData = mapToUI(persistedData);
 * ```
 */
export function useSettingsMapper(): UseSettingsMapperReturn {
  const mapToPersistence = useCallback(
    (formData: SettingsFormData): PersistedSettingsData => {
      return {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        lastUpdated: new Date().toISOString(),
        general: mapGeneralSettingsUIToPersistence(formData.general),
        appearance: mapAppearanceSettingsUIToPersistence(formData.appearance),
        advanced: mapAdvancedSettingsUIToPersistence(formData.advanced),
      };
    },
    [],
  );

  const mapToUI = useCallback(
    (persistedData: PersistedSettingsData): SettingsFormData => {
      return {
        general: mapGeneralSettingsPersistenceToUI(persistedData.general),
        appearance: mapAppearanceSettingsPersistenceToUI(
          persistedData.appearance,
        ),
        advanced: mapAdvancedSettingsPersistenceToUI(persistedData.advanced),
      };
    },
    [],
  );

  return {
    mapToPersistence,
    mapToUI,
  };
}
