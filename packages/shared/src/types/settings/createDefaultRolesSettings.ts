import type { PersistedRolesSettingsData } from "./PersistedRolesSettingsData";
import { CURRENT_ROLES_SCHEMA_VERSION } from "./rolesSettingsSchema";

/**
 * Creates default roles settings configuration with empty roles array.
 *
 * Used during application initialization, when creating new roles.json files,
 * and as a fallback when existing files are corrupted or invalid.
 *
 * @returns A valid default roles settings configuration
 * @example
 * ```typescript
 * const defaultConfig = createDefaultRolesSettings();
 * // Returns: { schemaVersion: "1.0.0", roles: [], lastUpdated: "2025-01-15T10:30:00.000Z" }
 * ```
 */
export const createDefaultRolesSettings = (): PersistedRolesSettingsData => ({
  schemaVersion: CURRENT_ROLES_SCHEMA_VERSION,
  roles: [],
  lastUpdated: new Date().toISOString(),
});
