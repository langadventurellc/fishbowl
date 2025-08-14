import { clampString } from "../../utils/transformers/clampString";

/**
 * Normalizes role fields by applying string constraints and defaults.
 *
 * This function ensures that role fields meet the required constraints:
 * - id: trimmed but not length-limited
 * - name: 1-100 characters after trimming
 * - description: 0-500 characters after trimming
 * - systemPrompt: 1-5000 characters after trimming (required)
 *
 * @param role - Role data to normalize
 * @returns Normalized role data with guaranteed field constraints
 *
 * @example
 * ```typescript
 * const role = {
 *   id: "  role-123  ",
 *   name: "  My Role  ",
 *   description: "  A really long description that might exceed the limit... ".repeat(20),
 *   systemPrompt: undefined
 * };
 *
 * const normalized = normalizeRoleFields(role);
 * // Returns role with trimmed, length-constrained fields and default systemPrompt
 * ```
 */
export function normalizeRoleFields(role: {
  id: string;
  name: string;
  description?: string | null;
  systemPrompt?: string | null;
}): {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
} {
  // Provide meaningful default for empty systemPrompt instead of padding with spaces
  const systemPrompt =
    role.systemPrompt?.trim() ||
    "You are a helpful assistant focused on your assigned role.";

  return {
    id: role.id?.trim() || "",
    name: clampString(role.name || "", 1, 100),
    description: clampString(role.description || "", 0, 500),
    systemPrompt: clampString(systemPrompt, 1, 5000),
  };
}
