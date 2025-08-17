import type { PersistedPersonalityData } from "@fishbowl-ai/shared";
import type { PersonalityViewModel } from "../../types/settings/PersonalityViewModel";
import { handleNullTimestamps } from "../utils/transformers/handleNullTimestamps";

/**
 * Maps a single persisted personality to UI view model format.
 *
 * This function transforms a persisted personality from JSON storage into the format expected
 * by UI components. It handles field normalization, timestamp generation for manual
 * JSON edits where timestamps might be null or undefined, and ID generation for personalities
 * that don't have an ID.
 *
 * @param persistedPersonality - The persisted personality data from JSON storage
 * @returns The personality formatted for UI display
 *
 * @example
 * ```typescript
 * const persistedPersonality: PersistedPersonalityData = {
 *   id: "personality-123",
 *   name: "Creative Thinker",
 *   bigFive: {
 *     openness: 90,
 *     conscientiousness: 70,
 *     extraversion: 60,
 *     agreeableness: 80,
 *     neuroticism: 30
 *   },
 *   behaviors: { "creativity": 85, "empathy": 75 },
 *   customInstructions: "Focus on creative solutions",
 *   createdAt: null,
 *   updatedAt: null
 * };
 *
 * const uiPersonality = mapSinglePersonalityPersistenceToUI(persistedPersonality);
 * // Returns PersonalityViewModel with generated timestamps and normalized fields
 * ```
 */
export function mapSinglePersonalityPersistenceToUI(
  persistedPersonality: PersistedPersonalityData,
): PersonalityViewModel {
  const timestamps = handleNullTimestamps({
    createdAt: persistedPersonality.createdAt,
    updatedAt: persistedPersonality.updatedAt,
  });

  return {
    id: persistedPersonality.id || "",
    name: persistedPersonality.name || "",
    bigFive: persistedPersonality.bigFive || {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
    },
    behaviors: persistedPersonality.behaviors || {},
    customInstructions: persistedPersonality.customInstructions || "",
    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  };
}
