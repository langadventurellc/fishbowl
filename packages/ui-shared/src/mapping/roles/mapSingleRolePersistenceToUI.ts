import type { PersistedRole } from "@fishbowl-ai/shared";
import type { RoleViewModel } from "../../types/settings/RoleViewModel";
import { handleNullTimestamps } from "../utils/transformers/handleNullTimestamps";
import { normalizeRoleFields } from "./utils/normalizeRoleFields";

/**
 * Maps a single persisted role to UI view model format.
 *
 * This function transforms a persisted role from JSON storage into the format expected
 * by UI components. It handles field normalization and timestamp generation for manual
 * JSON edits where timestamps might be null or undefined.
 *
 * @param persistedRole - The persisted role data from JSON storage
 * @returns The role formatted for UI display
 *
 * @example
 * ```typescript
 * const persistedRole: PersistedRole = {
 *   id: "role-123",
 *   name: "Project Manager",
 *   description: "Manages project timelines",
 *   systemPrompt: "You are a project manager...",
 *   createdAt: null,
 *   updatedAt: null
 * };
 *
 * const uiRole = mapSingleRolePersistenceToUI(persistedRole);
 * // Returns RoleViewModel with generated timestamps and normalized fields
 * ```
 */
export function mapSingleRolePersistenceToUI(
  persistedRole: PersistedRole,
): RoleViewModel {
  const normalizedFields = normalizeRoleFields(persistedRole);
  const timestamps = handleNullTimestamps({
    createdAt: persistedRole.createdAt,
    updatedAt: persistedRole.updatedAt,
  });

  return {
    id: normalizedFields.id,
    name: normalizedFields.name,
    description: normalizedFields.description,
    systemPrompt: normalizedFields.systemPrompt || undefined,
    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  };
}
