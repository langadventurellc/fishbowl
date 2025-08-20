import type { AgentSettingsViewModel } from "../../types/settings/AgentViewModel";
import type { PersistedAgentsSettingsData } from "@fishbowl-ai/shared";
import {
  persistedAgentsSettingsSchema,
  CURRENT_AGENTS_SCHEMA_VERSION,
} from "@fishbowl-ai/shared";
import { mapSingleAgentUIToPersistence } from "./mapSingleAgentUIToPersistence";

/**
 * Maps agents from UI format to persistence format.
 *
 * This function transforms an array of agent view models into the format expected
 * by the persistence layer. It ensures all agents are properly normalized,
 * validates the output against the persistence schema, and includes metadata
 * like schema version and last updated timestamp.
 *
 * @param agents - Array of UI agent view models to transform
 * @returns The agents data ready for persistence storage
 * @throws {Error} If the mapped data fails validation against the persistence schema
 *
 * @example
 * ```typescript
 * const uiAgents: AgentSettingsViewModel[] = [
 *   {
 *     id: "agent-1",
 *     name: "Test Agent",
 *     model: "Claude 3.5 Sonnet",
 *     role: "role-id",
 *     personality: "personality-id",
 *     temperature: 1.0,
 *     maxTokens: 2000,
 *     topP: 0.95,
 *     systemPrompt: "You are a helpful assistant",
 *     createdAt: "2025-01-10T09:00:00.000Z",
 *     updatedAt: "2025-01-14T15:30:00.000Z"
 *   }
 * ];
 *
 * const persistedData = mapAgentsUIToPersistence(uiAgents);
 * // Returns: PersistedAgentsSettingsData with validated agents
 * ```
 */
export function mapAgentsUIToPersistence(
  agents: AgentSettingsViewModel[],
): PersistedAgentsSettingsData {
  const mappedAgents = agents.map(mapSingleAgentUIToPersistence);

  const persistedData: PersistedAgentsSettingsData = {
    schemaVersion: CURRENT_AGENTS_SCHEMA_VERSION,
    agents: mappedAgents,
    defaults: {
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.9,
    },
    lastUpdated: new Date().toISOString(),
  };

  // Validate against schema
  const result = persistedAgentsSettingsSchema.safeParse(persistedData);
  if (!result.success) {
    throw new Error(`Invalid agents persistence data: ${result.error.message}`);
  }

  return result.data;
}
