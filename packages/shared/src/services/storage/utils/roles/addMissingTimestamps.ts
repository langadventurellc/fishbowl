import type { PersistedRoleData } from "../../../../types/settings";
import { normalizeTimestamps } from "./normalizeTimestamps";

export function addMissingTimestamps(
  roleData: Partial<PersistedRoleData>,
): PersistedRoleData {
  const now = new Date().toISOString();

  const normalized = normalizeTimestamps(roleData);

  const withTimestamps: PersistedRoleData = {
    ...normalized,
    createdAt: normalized.createdAt ?? now,
    updatedAt: normalized.updatedAt ?? now,
  } as PersistedRoleData;

  return withTimestamps;
}
