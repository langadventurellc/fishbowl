import type { RoleViewModel } from "../../types/settings/RoleViewModel";
import type { PersistedRolesSettingsData } from "@fishbowl-ai/shared";
import {
  persistedRolesSettingsSchema,
  CURRENT_ROLES_SCHEMA_VERSION,
} from "@fishbowl-ai/shared";
import { mapSingleRoleUIToPersistence } from "./mapSingleRoleUIToPersistence";

/**
 * Maps roles from UI format to persistence format.
 *
 * This function transforms an array of role view models into the format expected
 * by the persistence layer. It ensures all roles are properly normalized,
 * validates the output against the persistence schema, and includes metadata
 * like schema version and last updated timestamp.
 *
 * @param roles - Array of UI role view models to transform
 * @returns The roles data ready for persistence storage
 * @throws {Error} If the mapped data fails validation against the persistence schema
 *
 * @example
 * ```typescript
 * const uiRoles: RoleViewModel[] = [
 *   {
 *     id: "role-1",
 *     name: "Manager",
 *     description: "Manages tasks",
 *     systemPrompt: "You are a manager",
 *     createdAt: "2025-01-10T09:00:00.000Z",
 *     updatedAt: "2025-01-14T15:30:00.000Z"
 *   }
 * ];
 *
 * const persistedData = mapRolesUIToPersistence(uiRoles);
 * // Returns: PersistedRolesSettingsData with validated roles
 * ```
 */
export function mapRolesUIToPersistence(
  roles: RoleViewModel[],
): PersistedRolesSettingsData {
  const mappedRoles = roles.map(mapSingleRoleUIToPersistence);

  const persistedData: PersistedRolesSettingsData = {
    schemaVersion: CURRENT_ROLES_SCHEMA_VERSION,
    roles: mappedRoles,
    lastUpdated: new Date().toISOString(),
  };

  // Validate against schema
  const result = persistedRolesSettingsSchema.safeParse(persistedData);
  if (!result.success) {
    throw new Error(`Invalid roles persistence data: ${result.error.message}`);
  }

  return result.data;
}
