import type { PersistedAdvancedSettings } from "./PersistedAdvancedSettings";

/**
 * Creates default advanced settings with all required fields
 */
export const createDefaultAdvancedSettings = (): PersistedAdvancedSettings => ({
  debugLogging: false, // Off by default for performance/security
  experimentalFeatures: false, // Off by default for stability
});
