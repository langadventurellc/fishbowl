/**
 * Persistence-optimized interface for appearance settings.
 *
 * This interface is designed for JSON serialization/deserialization with:
 * - Flat structure (no nested objects)
 * - Primitive values only (number, string, boolean)
 * - Theme and UI customization properties
 * - Security-conscious validation limits for font sizes
 */
export interface PersistedAppearanceSettings {
  // Theme Selection
  theme: "light" | "dark" | "system";

  // Display Settings
  showTimestamps: "always" | "hover" | "never";
  showActivityTime: boolean;
  compactList: boolean;

  // Chat Display Settings
  fontSize: number; // 12-18px
  messageSpacing: "compact" | "normal" | "relaxed";
}
