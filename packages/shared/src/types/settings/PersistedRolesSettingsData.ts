import { z } from "zod";
import { persistedRolesSettingsSchema } from "./rolesSettingsSchema";

/**
 * Type inferred from the roles file schema for TypeScript usage.
 * Represents the complete validated roles.json file structure.
 */
export type PersistedRolesSettingsData = z.infer<
  typeof persistedRolesSettingsSchema
>;
