import type { PersonalityConfiguration } from "./PersonalityConfiguration";

/**
 * Personality data for creation (without generated fields)
 */
export type PersonalityCreationData = Omit<
  PersonalityConfiguration,
  "id" | "createdAt" | "updatedAt"
>;
