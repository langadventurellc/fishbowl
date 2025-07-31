/**
 * Validate that a role object matches the predefined role structure
 */

import type { PredefinedRole } from "../settings/PredefinedRole";

/**
 * Validate that a role object matches the predefined role structure
 * @param role - The role object to validate
 * @returns True if valid predefined role structure
 */
export function isValidPredefinedRole(role: unknown): role is PredefinedRole {
  if (!role || typeof role !== "object") return false;

  const r = role as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.name === "string" &&
    typeof r.description === "string" &&
    typeof r.icon === "string" &&
    (r.category === undefined || typeof r.category === "string")
  );
}
