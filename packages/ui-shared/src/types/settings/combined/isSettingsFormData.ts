import type { SettingsFormData } from "./SettingsFormData";

/**
 * Type guard to check if a value is a valid SettingsFormData object
 * Performs runtime validation of the settings structure
 *
 * @param value - The value to check
 * @returns True if the value is a valid SettingsFormData object
 */
export function isSettingsFormData(value: unknown): value is SettingsFormData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    "general" in data &&
    "appearance" in data &&
    "advanced" in data &&
    typeof data.general === "object" &&
    data.general !== null &&
    typeof data.appearance === "object" &&
    data.appearance !== null &&
    typeof data.advanced === "object" &&
    data.advanced !== null
  );
}
