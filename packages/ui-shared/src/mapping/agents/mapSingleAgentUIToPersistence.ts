import type { AgentSettingsViewModel } from "../../types/settings/AgentViewModel";
import type { PersistedAgentData } from "@fishbowl-ai/shared";
import { normalizeAgentFields } from "./utils/normalizeAgentFields";

/**
 * Maps a single UI agent to persistence format.
 *
 * This function transforms an agent view model from UI format into the format expected
 * by the persistence layer. It applies field normalization and generates timestamps
 * as needed.
 *
 * @param agent - The UI agent view model to transform
 * @returns The agent formatted for persistence storage
 *
 * @example
 * ```typescript
 * const uiAgent: AgentViewModel = {
 *   id: "agent-123",
 *   name: "Test Agent",
 *   model: "Claude 3.5 Sonnet",
 *   role: "role-id",
 *   personality: "personality-id",
 *   temperature: 1.0,
 *   maxTokens: 2000,
 *   topP: 0.95,
 *   systemPrompt: "You are a helpful assistant",
 *   createdAt: "2025-01-10T09:00:00.000Z",
 *   updatedAt: undefined
 * };
 *
 * const persistedAgent = mapSingleAgentUIToPersistence(uiAgent);
 * // Returns PersistedAgentData with normalized fields and generated updatedAt
 * ```
 */
export function mapSingleAgentUIToPersistence(
  agent: AgentSettingsViewModel,
): PersistedAgentData {
  const normalizedAgent = normalizeAgentFields(agent);

  return {
    id: normalizedAgent.id,
    name: normalizedAgent.name,
    model: normalizedAgent.model,
    role: normalizedAgent.role,
    personality: normalizedAgent.personality,
    systemPrompt: normalizedAgent.systemPrompt,
    createdAt: agent.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
