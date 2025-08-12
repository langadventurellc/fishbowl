/**
 * Handles null/undefined timestamps by generating new ISO timestamps for manual JSON edits.
 *
 * When users manually edit the roles.json file, they might leave timestamps as null or undefined.
 * This function detects such cases and generates appropriate timestamps to ensure data consistency.
 *
 * @param role - Role data with potentially null/undefined timestamps
 * @returns Object with valid ISO timestamp strings
 *
 * @example
 * ```typescript
 * const role = {
 *   createdAt: null,
 *   updatedAt: undefined
 * };
 *
 * const timestamps = handleNullTimestamps(role);
 * // Returns: { createdAt: "2025-01-15T10:00:00.000Z", updatedAt: "2025-01-15T10:00:00.000Z" }
 * ```
 *
 * @example
 * ```typescript
 * const role = {
 *   createdAt: "2025-01-14T10:00:00.000Z",
 *   updatedAt: "2025-01-15T11:00:00.000Z"
 * };
 *
 * const timestamps = handleNullTimestamps(role);
 * // Returns: { createdAt: "2025-01-14T10:00:00.000Z", updatedAt: "2025-01-15T11:00:00.000Z" }
 * ```
 */
export function handleNullTimestamps(role: {
  createdAt?: string | null;
  updatedAt?: string | null;
}): {
  createdAt: string;
  updatedAt: string;
} {
  const now = new Date().toISOString();

  const createdAt =
    role.createdAt &&
    typeof role.createdAt === "string" &&
    role.createdAt.trim() !== ""
      ? role.createdAt
      : now;

  const updatedAt =
    role.updatedAt &&
    typeof role.updatedAt === "string" &&
    role.updatedAt.trim() !== ""
      ? role.updatedAt
      : now;

  return {
    createdAt,
    updatedAt,
  };
}
