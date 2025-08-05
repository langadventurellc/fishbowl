/**
 * Field value validation utility function.
 *
 * Validates a single field value against its configuration definition.
 *
 * @fileoverview Single field value validation
 * @module types/llm-providers/validation/validateFieldValue
 */

import type { LlmFieldConfig } from "../LlmFieldConfig";
import type { LlmFieldValidationError } from "./LlmFieldValidationError";
import { LlmValidationErrorCode } from "./LlmValidationErrorCode";
import { isRequiredField } from "../isRequiredField";
import {
  isSecureTextField,
  isTextField,
  isCheckboxField,
} from "../fieldTypeGuards";
import { createFieldError } from "./createFieldError";

/**
 * Validates a single field value against its configuration.
 *
 * @param fieldId - The field ID for error reporting
 * @param value - The value to validate
 * @param field - The field configuration to validate against
 * @returns Validation error if invalid, null if valid
 */
export const validateFieldValue = (
  fieldId: string,
  value: unknown,
  field: LlmFieldConfig,
): LlmFieldValidationError | null => {
  // Type validation
  if (isTextField(field) || isSecureTextField(field)) {
    if (typeof value !== "string") {
      return createFieldError(
        fieldId,
        LlmValidationErrorCode.INVALID_FIELD_TYPE,
        `Expected string for ${field.type} field`,
      );
    }

    // Required field check
    if (isRequiredField(field) && value === "") {
      return createFieldError(
        fieldId,
        LlmValidationErrorCode.REQUIRED_FIELD_MISSING,
      );
    }

    // Length validation
    if (field.minLength !== undefined && value.length < field.minLength) {
      return createFieldError(
        fieldId,
        LlmValidationErrorCode.VALUE_TOO_SHORT,
        `Value must be at least ${field.minLength} characters`,
      );
    }

    if (field.maxLength !== undefined && value.length > field.maxLength) {
      return createFieldError(
        fieldId,
        LlmValidationErrorCode.VALUE_TOO_LONG,
        `Value must be no more than ${field.maxLength} characters`,
      );
    }

    // Pattern validation
    if (field.pattern && !new RegExp(field.pattern).test(value)) {
      return createFieldError(
        fieldId,
        LlmValidationErrorCode.PATTERN_MISMATCH,
        `Value does not match required pattern`,
      );
    }
  } else if (isCheckboxField(field)) {
    if (typeof value !== "boolean") {
      return createFieldError(
        fieldId,
        LlmValidationErrorCode.INVALID_FIELD_TYPE,
        "Expected boolean for checkbox field",
      );
    }
  }

  return null;
};
