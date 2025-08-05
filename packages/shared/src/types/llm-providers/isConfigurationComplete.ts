import type { LlmConfigurationValues } from "./LlmConfigurationValues";
import type { LlmFieldConfig } from "./LlmFieldConfig";
import { isRequiredField } from "./isRequiredField";

/**
 * Checks if a configuration has all required fields filled.
 *
 * @param values - The configuration values to check
 * @param fields - The field configurations
 * @returns True if all required fields have values
 *
 * @example
 * ```typescript
 * if (isConfigurationComplete(values, fields)) {
 *   // Safe to save configuration
 * }
 * ```
 */
export const isConfigurationComplete = (
  values: LlmConfigurationValues,
  fields: readonly LlmFieldConfig[],
): boolean => {
  return fields
    .filter(isRequiredField)
    .every((field) => values[field.id] !== undefined);
};
