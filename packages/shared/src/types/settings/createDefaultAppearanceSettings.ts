import type { PersistedAppearanceSettings } from "./PersistedAppearanceSettings";

/**
 * Creates default appearance settings with all required fields
 */
export const createDefaultAppearanceSettings =
  (): PersistedAppearanceSettings => ({
    theme: "system",
    showTimestamps: "hover",
    showActivityTime: true,
    compactList: false,
    fontSize: 14,
    messageSpacing: "normal",
  });
