import type { PersistedAgentsSettingsData } from "../../../../types/agents/PersistedAgentsSettingsData";

/**
 * Creates default empty agents settings data
 *
 * @returns Default agents settings with empty array and current timestamp
 */
export function createDefaultAgentsSettings(): PersistedAgentsSettingsData {
  const now = new Date().toISOString();

  return {
    schemaVersion: "1.0.0",
    agents: [],
    defaults: {
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.9,
    },
    lastUpdated: now,
  };
}
