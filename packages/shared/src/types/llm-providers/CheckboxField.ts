import type { BaseFieldConfig } from "./BaseFieldConfig";

/**
 * Configuration for checkbox (boolean) input fields.
 *
 * Used for on/off settings and boolean options.
 *
 * @example
 * ```typescript
 * const authHeaderField: CheckboxField = {
 *   type: "checkbox",
 *   id: "useAuthHeader",
 *   label: "Use Authorization Header",
 *   required: false,
 *   helperText: "Send API key in Authorization header instead of x-api-key",
 *   defaultValue: false
 * };
 * ```
 *
 * @module types/llm-providers/CheckboxField
 */
export interface CheckboxField extends BaseFieldConfig {
  /**
   * Discriminator for TypeScript discriminated union.
   * Always "checkbox" for checkbox fields.
   */
  type: "checkbox";

  /**
   * Default checked state when the field is not set.
   *
   * @example false for optional features
   */
  defaultValue?: boolean;
}
