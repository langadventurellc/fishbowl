import type { BaseFieldConfig } from "./BaseFieldConfig";

/**
 * Configuration for secure text input fields.
 *
 * Used for sensitive data like API keys that should be stored securely
 * and masked in the UI.
 *
 * @example
 * ```typescript
 * const apiKeyField: SecureTextField = {
 *   type: "secure-text",
 *   id: "apiKey",
 *   label: "API Key",
 *   placeholder: "sk-...",
 *   required: true,
 *   helperText: "Your OpenAI API key",
 *   minLength: 20
 * };
 * ```
 *
 * @module types/llm-providers/SecureTextField
 */
export interface SecureTextField extends BaseFieldConfig {
  /**
   * Discriminator for TypeScript discriminated union.
   * Always "secure-text" for secure text fields.
   */
  type: "secure-text";

  /**
   * Minimum length requirement for the field value.
   *
   * @example 20 for API keys
   */
  minLength?: number;

  /**
   * Maximum length allowed for the field value.
   *
   * @example 100 for API keys
   */
  maxLength?: number;

  /**
   * Regular expression pattern for validation.
   * The pattern string will be used to create a RegExp object.
   *
   * @example "^sk-[a-zA-Z0-9]+$" for OpenAI API keys
   */
  pattern?: string;
}
