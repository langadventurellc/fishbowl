/**
 * Main runtime configuration validation function.
 *
 * Validates complete configuration values against field definitions.
 *
 * @fileoverview Main configuration validation
 * @module types/llm-providers/validation/validateConfigurationValues
 */
import type { LlmFieldConfig } from "../LlmFieldConfig";
import type { LlmValidationResult } from "./LlmValidationResult";
import type { LlmFieldValidationError } from "./LlmFieldValidationError";
import { LlmValidationErrorCode } from "./LlmValidationErrorCode";
import { createValidResult } from "./createValidResult";
import { createInvalidResult } from "./createInvalidResult";
import { createFieldError } from "./createFieldError";
import { validateFieldValue } from "./validateFieldValue";

/**
 * Validates a complete set of configuration values against field definitions.
 *
 * @param values - The configuration values to validate
 * @param fields - The field definitions to validate against
 * @returns A validation result indicating success or failure with detailed errors
 */
export function validateConfigurationValues(
  values: Record<string, unknown>,
  fields: LlmFieldConfig[],
): LlmValidationResult {
  const errors: LlmFieldValidationError[] = [];

  // Create field lookup for efficient access
  const fieldMap = new Map(fields.map((field) => [field.id, field]));

  // Validate all provided values
  for (const [fieldId, value] of Object.entries(values)) {
    const field = fieldMap.get(fieldId);
    if (!field) {
      errors.push(
        createFieldError(
          fieldId,
          LlmValidationErrorCode.INVALID_CONFIGURATION,
          `Unknown field: ${fieldId}`,
        ),
      );
      continue;
    }

    const fieldError = validateFieldValue(fieldId, value, field);
    if (fieldError !== null) {
      errors.push(fieldError);
    }
  }

  // Check for missing required fields
  for (const field of fields) {
    if (field.required && !(field.id in values)) {
      errors.push(
        createFieldError(
          field.id,
          LlmValidationErrorCode.REQUIRED_FIELD_MISSING,
          `Required field '${field.label}' is missing`,
        ),
      );
    }
  }

  if (errors.length > 0) {
    return createInvalidResult(errors);
  }

  return createValidResult();
}
