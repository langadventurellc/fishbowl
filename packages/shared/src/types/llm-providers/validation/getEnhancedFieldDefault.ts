/**
 * Enhanced default value getter that uses existing field configuration.
 *
 * @fileoverview Enhanced field default value utility
 * @module types/llm-providers/validation/getEnhancedFieldDefault
 */

import type { LlmFieldConfig } from "../LlmFieldConfig";
import { getFieldDefaultValue } from "../getFieldDefaultValue";
import { getFieldTypeDefault } from "./getFieldTypeDefault";

/**
 * Enhanced default value getter that uses existing field configuration.
 * Leverages the established getFieldDefaultValue utility with fallback logic.
 *
 * @param field - Field configuration to get default for
 * @returns Default value from field config or type-appropriate fallback
 *
 * @example
 * ```typescript
 * const field: LlmFieldConfig = {
 *   id: 'base-url',
 *   type: 'text',
 *   label: 'Base URL',
 *   defaultValue: 'https://api.example.com'
 * };
 *
 * const defaultValue = getEnhancedFieldDefault(field);
 * // Returns 'https://api.example.com' or "" if no defaultValue
 * ```
 */
export function getEnhancedFieldDefault(
  field: LlmFieldConfig,
): string | boolean {
  const configuredDefault = getFieldDefaultValue(field);
  if (configuredDefault !== undefined) {
    return configuredDefault;
  }
  return getFieldTypeDefault(field.type);
}
