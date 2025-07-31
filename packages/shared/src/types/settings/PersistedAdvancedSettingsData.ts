import { z } from "zod";
import { advancedSettingsSchema } from "./advancedSettingsSchema";

/**
 * Type inferred from the schema for TypeScript usage
 */
export type PersistedAdvancedSettingsData = z.infer<
  typeof advancedSettingsSchema
>;
