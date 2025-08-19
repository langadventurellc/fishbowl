import type { PersistedAgentsSettingsData } from "@fishbowl-ai/shared";

/**
 * Agents save operation request type
 *
 * Contains the complete agents data to persist
 */
export interface AgentsSaveRequest {
  agents: PersistedAgentsSettingsData;
}
