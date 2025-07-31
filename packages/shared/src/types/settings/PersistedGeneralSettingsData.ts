import { z } from "zod";
import { generalSettingsSchema } from "./generalSettingsSchema";

/**
 * Type inferred from the schema for TypeScript usage
 */
export type PersistedGeneralSettingsData = z.infer<
  typeof generalSettingsSchema
>;
