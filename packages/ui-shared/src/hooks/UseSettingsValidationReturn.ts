import type { SettingsFormData } from "../types/settings/combined/SettingsFormData";
import type { SettingsCategory } from "../types/settings/combined/SettingsCategory";
import type { SettingsValidationResult } from "../types/settings/combined/SettingsValidationResult";

/**
 * Return type for the useSettingsValidation hook
 *
 * Defines the interface returned by useSettingsValidation, providing
 * comprehensive validation functions for settings data.
 *
 * @module types/hooks/UseSettingsValidationReturn
 */
export interface UseSettingsValidationReturn {
  /**
   * Validates complete settings form data
   * @param formData - Combined settings to validate
   * @returns Validation result with category-specific errors
   */
  validateSettings: (
    formData: Partial<SettingsFormData>,
  ) => SettingsValidationResult;

  /**
   * Validates a single settings category
   * @param category - The category to validate
   * @param data - The data to validate
   * @returns Array of validation errors or empty array
   */
  validateCategory: (category: SettingsCategory, data: unknown) => string[];

  /**
   * Checks if a partial update would result in valid settings
   * @param currentData - Current settings data
   * @param updates - Partial updates to apply
   * @returns Whether the merged data would be valid
   */
  canUpdate: (
    currentData: SettingsFormData,
    updates: Partial<SettingsFormData>,
  ) => boolean;
}
