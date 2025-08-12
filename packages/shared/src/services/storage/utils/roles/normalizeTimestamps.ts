import type { PersistedRoleData } from "../../../../types/settings/PersistedRoleData";

/**
 * Normalizes timestamps in role data, handling null values gracefully.
 * Useful for data from direct JSON edits.
 *
 * @param roleData - Partial role data with possibly invalid timestamps
 * @returns Role data with normalized timestamps
 */
export function normalizeTimestamps<T extends Partial<PersistedRoleData>>(
  roleData: T,
): T {
  const normalized = { ...roleData };

  // Handle createdAt
  if ("createdAt" in normalized) {
    if (normalized.createdAt === null || normalized.createdAt === undefined) {
      // Keep as is - null/undefined are valid
    } else if (typeof normalized.createdAt === "string") {
      // Validate ISO format
      try {
        new Date(normalized.createdAt).toISOString();
      } catch {
        // Invalid date string, set to null
        normalized.createdAt = null;
      }
    } else {
      // Invalid type, set to null
      normalized.createdAt = null;
    }
  }

  // Handle updatedAt
  if ("updatedAt" in normalized) {
    if (normalized.updatedAt === null || normalized.updatedAt === undefined) {
      // Keep as is - null/undefined are valid
    } else if (typeof normalized.updatedAt === "string") {
      // Validate ISO format
      try {
        new Date(normalized.updatedAt).toISOString();
      } catch {
        // Invalid date string, set to null
        normalized.updatedAt = null;
      }
    } else {
      // Invalid type, set to null
      normalized.updatedAt = null;
    }
  }

  return normalized;
}
