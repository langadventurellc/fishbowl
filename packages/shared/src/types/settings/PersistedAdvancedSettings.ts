/**
 * Persistence-optimized interface for advanced power-user settings.
 *
 * This interface is designed for JSON serialization/deserialization with:
 * - Flat structure (no nested objects)
 * - Primitive values only (boolean)
 * - Security-conscious defaults (both false)
 * - Developer and experimental feature toggles
 */
export interface PersistedAdvancedSettings {
  // Developer Options
  debugMode: boolean; // Enable debug logging in developer console

  // Experimental Features
  experimentalFeatures: boolean; // Access to features in development with instability risk
}
