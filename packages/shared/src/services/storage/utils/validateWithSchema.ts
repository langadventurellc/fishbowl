import { z } from "zod";
import { SettingsValidationError } from "../errors/SettingsValidationError.js";
import { createFieldErrors } from "./createFieldErrors.js";

/**
 * Validate data against a Zod schema with enhanced error handling
 *
 * @param data The data to validate
 * @param schema The Zod schema to validate against
 * @param context Optional context for error messages
 * @returns The validated and typed data
 * @throws SettingsValidationError if validation fails
 */
export function validateWithSchema<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  context?: string,
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const fieldErrors = createFieldErrors(result.error);
    throw new SettingsValidationError(
      context || "",
      "validateWithSchema",
      fieldErrors,
    );
  }

  return result.data;
}
