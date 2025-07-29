/**
 * Get all unique categories from predefined roles
 */

import { PREDEFINED_ROLES } from "../data/predefinedRoles";

/**
 * Get all unique categories from predefined roles
 * @returns Array of unique category strings
 */
export function getRoleCategories(): string[] {
  const categories = new Set<string>();
  PREDEFINED_ROLES.forEach((role) => {
    if (role.category) {
      categories.add(role.category);
    }
  });
  return Array.from(categories).sort();
}
