import type { PersistedRolesSettingsData } from "@fishbowl-ai/shared";
import type { RoleViewModel } from "../../types/settings/RoleViewModel";
import { mapSingleRolePersistenceToUI } from "./mapSingleRolePersistenceToUI";

/**
 * Maps persisted roles data to UI view model format.
 *
 * This function transforms persisted roles settings into the format expected
 * by UI components. It handles null/undefined input gracefully and transforms
 * each role using the single role mapper.
 *
 * @param persistedData - The roles data from persistence layer (can be null/undefined)
 * @returns Array of role view models ready for UI display
 *
 * @example
 * ```typescript
 * const persistedData: PersistedRolesSettingsData = {
 *   schemaVersion: "1.0.0",
 *   roles: [
 *     {
 *       id: "1",
 *       name: "Manager",
 *       description: "Manages tasks",
 *       systemPrompt: "You are a project manager...",
 *       createdAt: "2025-01-15T10:00:00.000Z",
 *       updatedAt: "2025-01-15T11:00:00.000Z"
 *     }
 *   ],
 *   lastUpdated: "2025-01-15T10:00:00.000Z"
 * };
 *
 * const uiRoles = mapRolesPersistenceToUI(persistedData);
 * // Returns: RoleViewModel[] ready for UI consumption
 * ```
 *
 * @example
 * ```typescript
 * // Handles null input gracefully
 * const uiRoles = mapRolesPersistenceToUI(null);
 * // Returns: []
 * ```
 *
 * @example
 * ```typescript
 * // Handles missing roles array
 * const incompleteData: PersistedRolesSettingsData = {
 *   schemaVersion: "1.0.0",
 *   roles: undefined,
 *   lastUpdated: "2025-01-15T10:00:00.000Z"
 * };
 * const uiRoles = mapRolesPersistenceToUI(incompleteData);
 * // Returns: []
 * ```
 */
export function mapRolesPersistenceToUI(
  persistedData: PersistedRolesSettingsData | null | undefined,
): RoleViewModel[] {
  // Handle null/undefined input
  if (!persistedData || !persistedData.roles) {
    return [];
  }

  // Transform each role using the single role mapper
  return persistedData.roles.map((role) => mapSingleRolePersistenceToUI(role));
}
