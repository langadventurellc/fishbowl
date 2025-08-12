import { z } from "zod";
import { persistedRoleSchema } from "./rolesSettingsSchema";

/**
 * Type inferred from the role schema for TypeScript usage
 */
export type PersistedRoleData = z.infer<typeof persistedRoleSchema>;
