import { z } from "zod";
import { persistedAgentsSettingsSchema } from "./persistedAgentsSettingsSchema";

/**
 * Type definition for the complete agents settings file structure
 * Includes schema version, agents array, and metadata
 */
export type PersistedAgentsSettingsData = z.infer<
  typeof persistedAgentsSettingsSchema
>;
