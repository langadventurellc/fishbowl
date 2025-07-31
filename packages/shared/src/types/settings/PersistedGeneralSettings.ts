/**
 * Persistence-optimized interface for general application settings.
 *
 * This interface is designed for JSON serialization/deserialization with:
 * - Flat structure (no nested objects)
 * - Primitive values only (number, string, boolean)
 * - Millisecond precision for time values
 * - Security-conscious validation limits
 */
export interface PersistedGeneralSettings {
  // Auto Mode Settings - stored in milliseconds for precision
  responseDelay: number; // 1000-30000ms (1-30 seconds)
  maximumMessages: number; // 0-500 (0 = unlimited)
  maximumWaitTime: number; // 5000-120000ms (5-120 seconds)

  // Conversation Defaults
  defaultMode: "manual" | "auto";
  maximumAgents: number; // 1-8

  // Other Settings
  checkUpdates: boolean;
}
