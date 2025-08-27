import type { PersistedPersonalitiesSettingsData } from "@fishbowl-ai/shared";
import type { PersonalityViewModel } from "../../types/settings/PersonalityViewModel";
import { mapSinglePersonalityPersistenceToUI } from "./mapSinglePersonalityPersistenceToUI";

/**
 * Maps persisted personalities data to UI view model format.
 *
 * This function transforms persisted personalities settings into the format expected
 * by UI components. It handles null/undefined input gracefully and transforms
 * each personality using the single personality mapper.
 *
 * @param persistedData - The personalities data from persistence layer (can be null/undefined)
 * @returns Array of personality view models ready for UI display
 *
 * @example
 * ```typescript
 * const persistedData: PersistedPersonalitiesSettingsData = {
 *   schemaVersion: "1.0.0",
 *   personalities: [
 *     {
 *       id: "1",
 *       name: "Creative Thinker",
 *       description: "A creative and innovative personality",
 *       systemPrompt: "You are a creative and innovative thinker...",
 *       behaviors: {
 *         communicationStyle: "expressive",
 *         decisionMaking: "intuitive",
 *         workApproach: "collaborative"
 *       },
 *       createdAt: "2025-01-15T10:00:00.000Z",
 *       updatedAt: "2025-01-15T11:00:00.000Z"
 *     }
 *   ],
 *   lastUpdated: "2025-01-15T10:00:00.000Z"
 * };
 *
 * const uiPersonalities = mapPersonalitiesPersistenceToUI(persistedData);
 * // Returns: PersonalityViewModel[] ready for UI consumption
 * ```
 *
 * @example
 * ```typescript
 * // Handles null input gracefully
 * const uiPersonalities = mapPersonalitiesPersistenceToUI(null);
 * // Returns: []
 * ```
 *
 * @example
 * ```typescript
 * // Handles missing personalities array
 * const incompleteData: PersistedPersonalitiesSettingsData = {
 *   schemaVersion: "1.0.0",
 *   personalities: undefined,
 *   lastUpdated: "2025-01-15T10:00:00.000Z"
 * };
 * const uiPersonalities = mapPersonalitiesPersistenceToUI(incompleteData);
 * // Returns: []
 * ```
 */
export function mapPersonalitiesPersistenceToUI(
  persistedData: PersistedPersonalitiesSettingsData | null | undefined,
): PersonalityViewModel[] {
  // Handle null/undefined input
  if (!persistedData || !persistedData.personalities) {
    return [];
  }

  // Transform each personality using the single personality mapper
  return persistedData.personalities.map((personality) =>
    mapSinglePersonalityPersistenceToUI(personality),
  );
}
