import type { PersistedGeneralSettings } from "./PersistedGeneralSettings";

/**
 * Creates default general settings with all required fields
 */
export const createDefaultGeneralSettings = (): PersistedGeneralSettings => ({
  responseDelay: 2000, // 2 seconds
  maximumMessages: 50,
  maximumWaitTime: 30000, // 30 seconds
  defaultMode: "manual",
  maximumAgents: 4,
  checkUpdates: true,
});
