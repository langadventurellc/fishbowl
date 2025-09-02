/**
 * Maps persisted agent settings data to UI view models
 *
 * This function transforms an array of persistence agent records into the format expected
 * by UI components, adding any necessary computed properties and ensuring
 * consistent data structure for the view layer.
 *
 * @param persistedData - Persisted agent settings data from storage
 * @returns Array of agent view models ready for UI display
 */

import type { PersistedAgentsSettingsData } from "@fishbowl-ai/shared";
import type { AgentSettingsViewModel } from "../../types/settings/AgentSettingsViewModel";
import { mapSingleAgentPersistenceToUI } from "./mapSingleAgentPersistenceToUI";

export function mapAgentsPersistenceToUI(
  persistedData: PersistedAgentsSettingsData,
): AgentSettingsViewModel[] {
  return persistedData.agents.map((agent) =>
    mapSingleAgentPersistenceToUI(agent),
  );
}
