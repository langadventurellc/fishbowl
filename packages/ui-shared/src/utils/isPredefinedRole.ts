/**
 * Check if a given role ID corresponds to a predefined role
 */

import { PREDEFINED_ROLES_MAP } from "../data/predefinedRoles";

/**
 * Check if a given role ID corresponds to a predefined role
 * @param roleId - The role ID to check
 * @returns True if the role is predefined, false otherwise
 */
export function isPredefinedRole(roleId: string): boolean {
  return roleId in PREDEFINED_ROLES_MAP;
}
