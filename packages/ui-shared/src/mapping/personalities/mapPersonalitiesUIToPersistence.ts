import type { PersonalityViewModel } from "../../types/settings/PersonalityViewModel";
import type { PersistedPersonalitiesSettingsData } from "@fishbowl-ai/shared";
import {
  persistedPersonalitiesSettingsSchema,
  CURRENT_PERSONALITIES_SCHEMA_VERSION,
} from "@fishbowl-ai/shared";
import { mapSinglePersonalityUIToPersistence } from "./mapSinglePersonalityUIToPersistence";

/**
 * Maps personalities from UI format to persistence format.
 *
 * This function transforms an array of personality view models into the format expected
 * by the persistence layer. It ensures all personalities are properly normalized,
 * validates the output against the persistence schema, and includes metadata
 * like schema version and last updated timestamp.
 *
 * @param personalities - Array of UI personality view models to transform
 * @returns The personalities data ready for persistence storage
 * @throws {Error} If the mapped data fails validation against the persistence schema
 *
 * @example
 * ```typescript
 * const uiPersonalities: PersonalityViewModel[] = [
 *   {
 *     id: "personality-1",
 *     name: "Creative Thinker",
 *     description: "A creative and innovative personality",
 *     systemPrompt: "You are a creative thinker",
 *     bigFive: {
 *       openness: 0.9,
 *       conscientiousness: 0.7,
 *       extraversion: 0.6,
 *       agreeableness: 0.8,
 *       neuroticism: 0.3
 *     },
 *     behaviors: {
 *       communicationStyle: "expressive",
 *       decisionMaking: "intuitive",
 *       workApproach: "collaborative"
 *     },
 *     createdAt: "2025-01-10T09:00:00.000Z",
 *     updatedAt: "2025-01-14T15:30:00.000Z"
 *   }
 * ];
 *
 * const persistedData = mapPersonalitiesUIToPersistence(uiPersonalities);
 * // Returns: PersistedPersonalitiesSettingsData with validated personalities
 * ```
 */
export function mapPersonalitiesUIToPersistence(
  personalities: PersonalityViewModel[],
): PersistedPersonalitiesSettingsData {
  const mappedPersonalities = personalities.map(
    mapSinglePersonalityUIToPersistence,
  );

  const persistedData: PersistedPersonalitiesSettingsData = {
    schemaVersion: CURRENT_PERSONALITIES_SCHEMA_VERSION,
    personalities: mappedPersonalities,
    lastUpdated: new Date().toISOString(),
  };

  // Validate against schema
  const result = persistedPersonalitiesSettingsSchema.safeParse(persistedData);
  if (!result.success) {
    throw new Error(
      `Invalid personalities persistence data: ${result.error.message}`,
    );
  }

  return result.data;
}
