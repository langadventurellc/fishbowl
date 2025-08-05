/**
 * Applies default values to partial field configurations.
 *
 * @fileoverview Field defaults application utility
 * @module types/llm-providers/validation/applyFieldDefaults
 */

import type { LlmFieldConfig } from "../LlmFieldConfig";

/**
 * Applies default values to partial field configurations.
 * Fills in missing optional properties with sensible defaults.
 *
 * @param fields - Array of partial field configurations
 * @returns Array of complete field configurations with defaults applied
 *
 * @example
 * ```typescript
 * const partialFields = [
 *   { id: 'api-key', type: 'secure-text', label: 'API Key' },
 *   { id: 'use-auth', type: 'checkbox', label: 'Use Auth' },
 * ];
 *
 * const completeFields = applyFieldDefaults(partialFields);
 * // All fields now have required: false, placeholder: "" etc.
 * ```
 */
export function applyFieldDefaults(
  fields: Partial<LlmFieldConfig>[],
): LlmFieldConfig[] {
  return fields.map((field) => ({
    required: false,
    placeholder: "",
    ...field,
  })) as LlmFieldConfig[];
}
