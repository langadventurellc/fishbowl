/**
 * Gets the default value for a specific field type.
 *
 * @fileoverview Field type default value utility
 * @module types/llm-providers/validation/getFieldTypeDefault
 */

/**
 * Gets the default value for a specific field type.
 * Provides type-appropriate default values for form initialization.
 *
 * @param type - The field type identifier
 * @returns Default value appropriate for the field type
 *
 * @example
 * ```typescript
 * const textDefault = getFieldTypeDefault('text'); // ""
 * const checkboxDefault = getFieldTypeDefault('checkbox'); // false
 * const secureDefault = getFieldTypeDefault('secure-text'); // ""
 * ```
 */
export function getFieldTypeDefault(type: string): string | boolean {
  switch (type) {
    case "text":
    case "secure-text":
      return "";
    case "checkbox":
      return false;
    default:
      return "";
  }
}
