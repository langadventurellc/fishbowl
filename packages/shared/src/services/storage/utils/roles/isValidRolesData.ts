import { persistedRolesSettingsSchema } from "../../../../types/settings/rolesSettingsSchema";

/**
 * Fast boolean check for roles data validity without detailed errors.
 * Optimized for performance when error details aren't needed.
 *
 * @param data - Data to validate
 * @returns True if data is valid according to schema
 *
 * @example
 * ```typescript
 * if (!isValidRolesData(userInput)) {
 *   return { error: "Invalid roles data" };
 * }
 * ```
 */
export function isValidRolesData(data: unknown): boolean {
  const result = persistedRolesSettingsSchema.safeParse(data);
  return result.success;
}
