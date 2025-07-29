/**
 * Get all predefined roles, optionally filtered by category
 */

import type { PredefinedRole } from "../types/settings/PredefinedRole";
import { PREDEFINED_ROLES } from "../data/predefinedRoles";

/**
 * Get all predefined roles, optionally filtered by category
 * @param category - Optional category to filter by
 * @returns Array of matching predefined roles
 */
export function getRolesByCategory(category?: string): PredefinedRole[] {
  if (!category) {
    return [...PREDEFINED_ROLES];
  }

  return PREDEFINED_ROLES.filter((role) => role.category === category);
}
