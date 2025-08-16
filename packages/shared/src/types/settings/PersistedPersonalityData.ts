import { z } from "zod";
import { persistedPersonalitySchema } from "./personalitiesSettingsSchema";

/**
 * Type definition for a single persisted personality
 * Derived from Zod schema for type safety
 */
export type PersistedPersonalityData = z.infer<
  typeof persistedPersonalitySchema
>;
