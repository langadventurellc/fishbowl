import { persistedRoleSchema } from "../../../../types/settings/rolesSettingsSchema";
import type { PersistedRoleData } from "../../../../types/settings/PersistedRoleData";

/**
 * Filters an array to return only valid roles.
 * Silently discards invalid roles without error reporting.
 *
 * @param roles - Array of potential role objects
 * @returns Array of valid PersistedRoleData objects
 */
export function filterValidRoles(roles: unknown[]): PersistedRoleData[] {
  if (!Array.isArray(roles)) {
    return [];
  }

  return roles
    .map((role) => {
      const result = persistedRoleSchema.safeParse(role);
      return result.success ? result.data : null;
    })
    .filter((role): role is PersistedRoleData => role !== null);
}
