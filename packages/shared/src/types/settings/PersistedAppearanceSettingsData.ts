import { z } from "zod";
import { appearanceSettingsSchema } from "./appearanceSettingsSchema";

/**
 * Type inferred from the schema for TypeScript usage
 */
export type PersistedAppearanceSettingsData = z.infer<
  typeof appearanceSettingsSchema
>;
