import type { SettingsFormData } from "./SettingsFormData";
import type { SettingsCategory } from "./SettingsCategory";

/**
 * Type guard to check if a specific category exists and is valid in SettingsFormData
 * Provides type narrowing for accessing category-specific data safely
 *
 * @param data - The settings form data to check
 * @param category - The category to validate
 * @returns True if the category exists and contains valid data
 */
export function hasSettingsCategory(
  data: SettingsFormData,
  category: SettingsCategory,
): boolean {
  return (
    category in data &&
    data[category] !== null &&
    data[category] !== undefined &&
    typeof data[category] === "object"
  );
}
