/**
 * Partial runtime configuration validation function.
 *
 * Validates a subset of configuration values for incremental updates.
 *
 * @fileoverview Partial configuration validation
 * @module types/llm-providers/validation/validatePartialConfigurationValues
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
 * Validates a partial set of configuration values against field definitions.
 * This is useful for incremental validation during user input or when validating
 * individual fields without requiring all required fields to be present.
 *
 * @param values - The partial configuration values to validate
 * @param fields - The field definitions to validate against
 * @returns A validation result indicating success or failure with detailed errors
 */
export function validatePartialConfigurationValues(
  values: Record<string, unknown>,
  fields: LlmFieldConfig[],
): LlmValidationResult {
  const errors: LlmFieldValidationError[] = [];

  // Create field lookup for efficient access
  const fieldMap = new Map(fields.map((field) => [field.id, field]));

  // Validate only provided values (don't check for missing required fields)
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

  if (errors.length > 0) {
    return createInvalidResult(errors);
  }

  return createValidResult();
}
