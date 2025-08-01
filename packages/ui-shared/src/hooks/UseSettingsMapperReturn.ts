import type { SettingsFormData } from "../types/settings/combined/SettingsFormData";
import type { PersistedSettingsData } from "@fishbowl-ai/shared";

/**
 * Return type for the useSettingsMapper hook
 *
 * Defines the interface returned by useSettingsMapper, providing
 * bidirectional mapping functions for settings transformation.
 *
 * @module types/hooks/UseSettingsMapperReturn
 */
export interface UseSettingsMapperReturn {
  /**
   * Maps settings from UI form data to persistence format
   * Adds metadata including schema version and timestamp
   */
  mapToPersistence: (formData: SettingsFormData) => PersistedSettingsData;
  /**
   * Maps settings from persistence format to UI form data
   * Extracts settings data without metadata
   */
  mapToUI: (persistedData: PersistedSettingsData) => SettingsFormData;
}
