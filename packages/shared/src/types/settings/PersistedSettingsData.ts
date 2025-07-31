import { z } from "zod";
import { persistedSettingsSchema } from "./persistedSettingsSchema";

/**
 * Type inferred from the master schema for TypeScript usage.
 * This represents the validated and parsed settings data structure.
 */
export type PersistedSettingsData = z.infer<typeof persistedSettingsSchema>;
