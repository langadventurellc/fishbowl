import type { PersistedPersonalitiesSettingsData } from "@fishbowl-ai/shared";

/**
 * Personalities save operation request type
 *
 * Contains the complete personalities data to persist
 */
export interface PersonalitiesSaveRequest {
  personalities: PersistedPersonalitiesSettingsData;
}
