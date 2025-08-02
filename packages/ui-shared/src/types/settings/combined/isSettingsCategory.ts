import type { SettingsCategory } from "./SettingsCategory";

/**
 * Type guard to check if a value is a valid SettingsCategory
 * Ensures the category is one of the supported settings sections
 *
 * @param value - The value to check
 * @returns True if the value is a valid settings category
 */
export function isSettingsCategory(value: unknown): value is SettingsCategory {
  return (
    typeof value === "string" &&
    ["general", "appearance", "advanced"].includes(value)
  );
}
