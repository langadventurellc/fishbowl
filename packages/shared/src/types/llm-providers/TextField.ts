import type { BaseFieldConfig } from "./BaseFieldConfig";

/**
 * Configuration for regular text input fields.
 *
 * Used for non-sensitive text data like URLs or configuration values.
 *
 * @example
 * ```typescript
 * const baseUrlField: TextField = {
 *   type: "text",
 *   id: "baseUrl",
 *   label: "Base URL",
 *   placeholder: "https://api.anthropic.com",
 *   required: false,
 *   helperText: "Optional: Custom API endpoint",
 *   defaultValue: "https://api.anthropic.com"
 * };
 * ```
 *
 * @module types/llm-providers/TextField
 */
export interface TextField extends BaseFieldConfig {
  /**
   * Discriminator for TypeScript discriminated union.
   * Always "text" for text fields.
   */
  type: "text";

  /**
   * Default value to use when the field is not filled.
   *
   * @example "https://api.anthropic.com" for base URL
   */
  defaultValue?: string;

  /**
   * Minimum length requirement for the field value.
   */
  minLength?: number;

  /**
   * Maximum length allowed for the field value.
   */
  maxLength?: number;

  /**
   * Regular expression pattern for validation.
   * The pattern string will be used to create a RegExp object.
   *
   * @example "^https?://" for URL validation
   */
  pattern?: string;
}
