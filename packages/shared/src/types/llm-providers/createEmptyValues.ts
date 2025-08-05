import type { LlmFieldConfig } from "./LlmFieldConfig";
import type { LlmConfigurationValues } from "./LlmConfigurationValues";
import { getFieldDefaultValue } from "./getFieldDefaultValue";

/**
 * Creates an empty configuration values object with default values.
 *
 * @param fields - Array of field configurations
 * @returns Configuration values with defaults
 *
 * @example
 * ```typescript
 * const values = createEmptyValues(provider.configuration.fields);
 * ```
 */
export const createEmptyValues = (
  fields: readonly LlmFieldConfig[],
): LlmConfigurationValues => {
  const values: LlmConfigurationValues = {};
  for (const field of fields) {
    const defaultValue = getFieldDefaultValue(field);
    if (defaultValue !== undefined) {
      values[field.id] = defaultValue;
    }
  }
  return values;
};
