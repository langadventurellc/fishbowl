import type { LlmFieldConfig } from "./LlmFieldConfig";

/**
 * Gets the default value for a field configuration.
 *
 * @param field - The field configuration
 * @returns The default value or undefined
 *
 * @example
 * ```typescript
 * const defaultValue = getFieldDefaultValue(field);
 * if (defaultValue !== undefined) {
 *   values[field.id] = defaultValue;
 * }
 * ```
 */
export const getFieldDefaultValue = (
  field: LlmFieldConfig,
): string | boolean | undefined => {
  switch (field.type) {
    case "text":
      return field.defaultValue;
    case "checkbox":
      return field.defaultValue;
    case "secure-text":
      return undefined; // No defaults for secure fields
  }
};
