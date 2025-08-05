/**
 * Storage format for field values in a provider configuration.
 *
 * Maps field IDs to their corresponding values. Values are stored as unknown
 * and should be type-checked using field configuration metadata.
 *
 * @example
 * ```typescript
 * const values: LlmConfigurationValues = {
 *   apiKey: "sk-1234567890abcdef",
 *   baseUrl: "https://api.openai.com/v1",
 *   useAuthHeader: true,
 *   customName: "My OpenAI Config"
 * };
 * ```
 *
 * @module types/llm-providers/LlmConfigurationValues
 */
export interface LlmConfigurationValues {
  [fieldId: string]: unknown;
}
