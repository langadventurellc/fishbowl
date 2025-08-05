import { z } from "zod";
import type { LlmFieldConfig } from "../LlmFieldConfig";
import type { LlmFieldValidationError } from "./LlmFieldValidationError";
import { createFieldError } from "./createFieldError";
import { mapZodCodeToErrorCode } from "./mapZodCodeToErrorCode";
import { formatZodMessage } from "./formatZodMessage";

/**
 * Converts Zod validation errors to LLM field validation errors.
 *
 * @param zodError - The Zod error to convert
 * @param fieldConfigs - Optional field configurations for label lookup
 * @returns Array of field validation errors
 */
export function zodToFieldErrors(
  zodError: z.ZodError,
  fieldConfigs?: LlmFieldConfig[],
): LlmFieldValidationError[] {
  const errors: LlmFieldValidationError[] = [];

  for (const issue of zodError.issues) {
    // Extract field ID from path - use last string element or empty string
    const fieldId =
      issue.path.length > 0
        ? issue.path[issue.path.length - 1]?.toString() || ""
        : "";

    // Find field config by ID
    const field = fieldConfigs?.find((f) => f.id === fieldId);

    // Map error code and format message
    const code = mapZodCodeToErrorCode(issue);
    const message = formatZodMessage(issue, field);

    // Create field error using existing utility
    errors.push(createFieldError(fieldId, code, message));
  }

  return errors;
}
