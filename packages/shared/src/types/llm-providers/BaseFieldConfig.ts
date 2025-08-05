/**
 * Base configuration interface for all LLM provider form fields.
 *
 * Contains common properties shared across all field types.
 *
 * @module types/llm-providers/BaseFieldConfig
 */
export interface BaseFieldConfig {
  /**
   * Unique identifier for the field within a provider configuration.
   *
   * @example "apiKey", "baseUrl", "useAuthHeader"
   */
  id: string;

  /**
   * Display label shown in the UI for this field.
   *
   * @example "API Key", "Base URL", "Use Authorization Header"
   */
  label: string;

  /**
   * Placeholder text shown when the field is empty.
   *
   * @example "sk-...", "https://api.anthropic.com"
   */
  placeholder?: string;

  /**
   * Whether this field must be filled for the configuration to be valid.
   */
  required: boolean;

  /**
   * Helper text displayed below the field to provide additional context.
   *
   * @example "Your OpenAI API key", "Optional: Custom API endpoint"
   */
  helperText?: string;
}
