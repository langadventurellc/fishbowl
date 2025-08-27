import type { PersistedPersonalityData } from "@fishbowl-ai/shared";
import type { PersonalityViewModel } from "../../types/settings/PersonalityViewModel";

/**
 * Maps a single UI personality to persistence format.
 *
 * This function transforms a personality view model from UI format into the format expected
 * by the persistence layer. It applies field normalization and generates timestamps
 * as needed.
 *
 * @param personality - The UI personality view model to transform
 * @returns The personality formatted for persistence storage
 *
 * @example
 * ```typescript
 * const uiPersonality: PersonalityViewModel = {
 *   id: "personality-123",
 *   name: "Creative Thinker",
 *   behaviors: { "creativity": 85, "empathy": 75 },
 *   customInstructions: "Focus on creative solutions",
 *   createdAt: "2025-01-10T09:00:00.000Z",
 *   updatedAt: undefined
 * };
 *
 * const persistedPersonality = mapSinglePersonalityUIToPersistence(uiPersonality);
 * // Returns PersistedPersonalityData with normalized fields and generated updatedAt
 * ```
 */
export function mapSinglePersonalityUIToPersistence(
  personality: PersonalityViewModel,
): PersistedPersonalityData {
  return {
    id: personality.id || "",
    name: personality.name,
    behaviors: personality.behaviors,
    customInstructions: personality.customInstructions,
    createdAt: personality.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
