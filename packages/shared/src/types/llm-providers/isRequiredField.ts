import type { LlmFieldConfig } from "./LlmFieldConfig";

/**
 * Checks if a field configuration is marked as required.
 *
 * @param field - The field configuration to check
 * @returns True if the field is required
 *
 * @example
 * ```typescript
 * const requiredFields = fields.filter(isRequiredField);
 * ```
 */
export const isRequiredField = (field: LlmFieldConfig): boolean =>
  field.required;
