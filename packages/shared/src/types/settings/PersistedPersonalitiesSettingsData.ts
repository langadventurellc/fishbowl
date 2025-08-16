import { z } from "zod";
import { persistedPersonalitiesSettingsSchema } from "./personalitiesSettingsSchema";

/**
 * Type definition for the complete personalities settings file structure
 * Includes schema version, personalities array, and metadata
 */
export type PersistedPersonalitiesSettingsData = z.infer<
  typeof persistedPersonalitiesSettingsSchema
>;
