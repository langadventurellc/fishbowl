import type { PersistedRoleData } from "../../../../types/settings/PersistedRoleData";

/**
 * Adds default timestamps to role data if missing.
 * Useful when creating new roles.
 *
 * @param roleData - Role data without timestamps
 * @returns Role data with current timestamps added
 */
export function addDefaultTimestamps<
  T extends Omit<PersistedRoleData, "createdAt" | "updatedAt">,
>(roleData: T): T & { createdAt: string; updatedAt: string } {
  const now = new Date().toISOString();
  return {
    ...roleData,
    createdAt: now,
    updatedAt: now,
  };
}
