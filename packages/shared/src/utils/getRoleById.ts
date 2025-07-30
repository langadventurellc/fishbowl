/**
 * Retrieve a predefined role by its unique identifier
 */

import { PREDEFINED_ROLES_MAP } from "../data/predefinedRoles";
import type { PredefinedRole } from "../types/ui/settings/PredefinedRole";

/**
 * Retrieve a predefined role by its unique identifier
 * @param id - The role ID to search for
 * @returns The matching role or undefined if not found
 */
export function getRoleById(id: string): PredefinedRole | undefined {
  return PREDEFINED_ROLES_MAP[id];
}
