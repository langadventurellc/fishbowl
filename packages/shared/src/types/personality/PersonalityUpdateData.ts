import type { PersonalityConfiguration } from "./PersonalityConfiguration";

/**
 * Personality data for updates (all fields optional except id)
 */
export type PersonalityUpdateData = Partial<PersonalityConfiguration> & {
  id: string;
};
