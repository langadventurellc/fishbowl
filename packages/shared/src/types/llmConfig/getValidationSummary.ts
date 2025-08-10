import type { ValidationError } from "./ValidationError";
import { groupErrorsByField } from "../../validation/groupErrorsByField";
import { getFieldDisplayName } from "./getFieldDisplayName";

/**
 * Generates user-friendly summary of validation errors
 */
export function getValidationSummary(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return "";
  }

  if (errors.length === 1) {
    return errors[0]?.message || "Validation error occurred";
  }

  const fieldErrors = groupErrorsByField(errors);
  const fieldCount = Object.keys(fieldErrors).length;

  if (fieldCount === 1) {
    const field = Object.keys(fieldErrors)[0];
    if (field) {
      const fieldName = getFieldDisplayName(field);
      return `${fieldName} has ${errors.length} validation issues`;
    }
  }

  return `${fieldCount} fields have validation errors`;
}
