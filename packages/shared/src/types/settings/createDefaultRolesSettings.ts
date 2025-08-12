import type { PersistedRolesSettingsData } from "./PersistedRolesSettingsData";
import { persistedRolesSettingsSchema } from "./rolesSettingsSchema";
import defaultRolesJson from "../../data/defaultRoles.json";

/**
 * Creates default roles settings configuration with predefined roles from JSON.
 *
 * Loads initial roles from a static JSON file and validates them against
 * the schema. Adds current timestamp for lastUpdated field.
 *
 * Used during application initialization, when creating new roles.json files,
 * and as a fallback when existing files are corrupted or invalid.
 *
 * @returns A valid default roles settings configuration with initial roles
 * @throws {Error} If the default roles JSON is invalid against the schema
 * @example
 * ```typescript
 * const defaultConfig = createDefaultRolesSettings();
 * // Returns: { schemaVersion: "1.0.0", roles: [...4 default roles], lastUpdated: "2025-01-15T10:30:00.000Z" }
 * ```
 */
export const createDefaultRolesSettings = (): PersistedRolesSettingsData => {
  // Parse and validate the default roles JSON
  const result = persistedRolesSettingsSchema.safeParse({
    ...defaultRolesJson,
    lastUpdated: new Date().toISOString(),
  });

  if (!result.success) {
    // This should never happen in production as the JSON is validated at build time
    throw new Error(
      `Invalid default roles configuration: ${result.error.message}`,
    );
  }

  return result.data;
};
