import type { RoleViewModel } from "../../types/settings/RoleViewModel";
import type { PersistedRoleData } from "@fishbowl-ai/shared";
import { normalizeRoleFields } from "./utils/normalizeRoleFields";

/**
 * Maps a single UI role to persistence format.
 *
 * This function transforms a role view model from UI format into the format expected
 * by the persistence layer. It applies field normalization and generates timestamps
 * as needed.
 *
 * @param role - The UI role view model to transform
 * @returns The role formatted for persistence storage
 *
 * @example
 * ```typescript
 * const uiRole: RoleViewModel = {
 *   id: "role-123",
 *   name: "Project Manager",
 *   description: "Manages projects",
 *   systemPrompt: "You are a project manager",
 *   createdAt: "2025-01-10T09:00:00.000Z",
 *   updatedAt: undefined
 * };
 *
 * const persistedRole = mapSingleRoleUIToPersistence(uiRole);
 * // Returns PersistedRoleData with normalized fields and generated updatedAt
 * ```
 */
export function mapSingleRoleUIToPersistence(
  role: RoleViewModel,
): PersistedRoleData {
  const normalizedRole = normalizeRoleFields(role);

  return {
    id: normalizedRole.id,
    name: normalizedRole.name,
    description: normalizedRole.description,
    systemPrompt: normalizedRole.systemPrompt,
    createdAt: role.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
