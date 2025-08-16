import { z } from "zod";
import { SettingsValidationError } from "../errors/SettingsValidationError";
import { validateWithSchema } from "../../../validation/validateWithSchema";

/**
 * Validates personalities data against a Zod schema with enhanced error handling.
 * Follows the exact pattern established by validateSettingsData() and validateRolesData() for consistency.
 *
 * This function provides comprehensive validation for personalities data, including:
 * - Schema validation using Zod
 * - Field-level error reporting with detailed context
 * - Graceful handling of null timestamps (for direct JSON edits)
 * - Operation and file path context for debugging
 *
 * @param data The data to validate (typically from personalities.json)
 * @param schema The Zod schema to validate against (typically persistedPersonalitiesSettingsSchema)
 * @param filePath The file path for error context (e.g., "/path/to/personalities.json")
 * @param operation The operation being performed for error context (e.g., "loadPersonalities", "savePersonalities")
 * @returns The validated and typed data
 * @throws SettingsValidationError with field-level error details and context
 *
 * @example
 * ```typescript
 * import { persistedPersonalitiesSettingsSchema } from "@fishbowl-ai/shared/types/settings";
 *
 * const validatedPersonalities = validatePersonalitiesData(
 *   rawData,
 *   persistedPersonalitiesSettingsSchema,
 *   "/Users/app/personalities.json",
 *   "loadPersonalities"
 * );
 * ```
 */
export function validatePersonalitiesData<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  filePath: string,
  operation: string,
): T {
  try {
    return validateWithSchema(
      data,
      schema,
      `Personalities validation for ${filePath}`,
    );
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
