import type { PersistedAgentData } from "@fishbowl-ai/shared";
import type { AgentSettingsViewModel } from "../../types/settings/AgentViewModel";
import { handleNullTimestamps } from "../utils/transformers/handleNullTimestamps";
import { normalizeAgentFields } from "./utils/normalizeAgentFields";

/**
 * Maps a single persisted agent to UI view model format.
 *
 * This function transforms a persisted agent from JSON storage into the format expected
 * by UI components. It handles field normalization and timestamp generation for manual
 * JSON edits where timestamps might be null or undefined.
 *
 * @param persistedAgent - The persisted agent data from JSON storage
 * @returns The agent formatted for UI display
 *
 * @example
 * ```typescript
 * const persistedAgent: PersistedAgentData = {
 *   id: "agent-123",
 *   name: "Test Agent",
 *   model: "Claude 3.5 Sonnet",
 *   role: "role-id",
 *   personality: "personality-id",
 *   temperature: 1.0,
 *   maxTokens: 2000,
 *   topP: 0.95,
 *   systemPrompt: "You are a helpful assistant",
 *   createdAt: null,
 *   updatedAt: null
 * };
 *
 * const uiAgent = mapSingleAgentPersistenceToUI(persistedAgent);
 * // Returns AgentSettingsViewModel with generated timestamps and normalized fields
 * ```
 */
export function mapSingleAgentPersistenceToUI(
  persistedAgent: PersistedAgentData,
): AgentSettingsViewModel {
  const normalizedFields = normalizeAgentFields(persistedAgent);
  const timestamps = handleNullTimestamps({
    createdAt: persistedAgent.createdAt,
    updatedAt: persistedAgent.updatedAt,
  });

  return {
    id: normalizedFields.id,
    name: normalizedFields.name,
    model: normalizedFields.model,
    role: normalizedFields.role,
    personality: normalizedFields.personality,
    temperature: normalizedFields.temperature,
    maxTokens: normalizedFields.maxTokens,
    topP: normalizedFields.topP,
    systemPrompt: normalizedFields.systemPrompt,
    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  };
}
