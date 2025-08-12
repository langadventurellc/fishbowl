import { z } from "zod";
import { SettingsValidationError } from "../errors/SettingsValidationError";
import { validateWithSchema } from "../../../validation/validateWithSchema";

/**
 * High-level settings validation with complete error handling
 *
 * @param data The data to validate
 * @param schema The Zod schema to validate against
 * @param filePath The file path for error context
 * @param operation The operation being performed for error context
 * @returns The validated and typed data
 * @throws SettingsValidationError with enhanced context information
 */
export function validateSettingsData<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  filePath: string,
  operation: string,
): T {
  try {
    return validateWithSchema(
      data,
      schema,
      `Settings validation for ${filePath}`,
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
