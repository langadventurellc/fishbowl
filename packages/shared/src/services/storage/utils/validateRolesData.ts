import { z } from "zod";
import { SettingsValidationError } from "../errors/SettingsValidationError";
import { validateWithSchema } from "../../../validation/validateWithSchema";

/**
 * Validates roles data against a Zod schema with enhanced error handling.
 * Follows the exact pattern established by validateSettingsData() for consistency.
 *
 * This function provides comprehensive validation for roles data, including:
 * - Schema validation using Zod
 * - Field-level error reporting with detailed context
 * - Graceful handling of null timestamps (for direct JSON edits)
 * - Operation and file path context for debugging
 *
 * @param data The data to validate (typically from roles.json)
 * @param schema The Zod schema to validate against (typically persistedRolesSettingsSchema)
 * @param filePath The file path for error context (e.g., "/path/to/roles.json")
 * @param operation The operation being performed for error context (e.g., "loadRoles", "saveRoles")
 * @returns The validated and typed data
 * @throws SettingsValidationError with field-level error details and context
 *
 * @example
 * ```typescript
 * import { persistedRolesSettingsSchema } from "@fishbowl-ai/shared/types/settings";
 *
 * const validatedRoles = validateRolesData(
 *   rawData,
 *   persistedRolesSettingsSchema,
 *   "/Users/app/roles.json",
 *   "loadRoles"
 * );
 * ```
 */
export function validateRolesData<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  filePath: string,
  operation: string,
): T {
  try {
    return validateWithSchema(data, schema, `Roles validation for ${filePath}`);
  } catch (error) {
    if (error instanceof SettingsValidationError) {
      // Re-throw with additional operation context
      throw new SettingsValidationError(filePath, operation, error.fieldErrors);
    }
    // Unexpected error - wrap it
    throw new SettingsValidationError(filePath, operation, [
      { path: "root", message: `Unexpected validation error: ${error}` },
    ]);
  }
}
