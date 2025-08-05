import type { LlmFieldConfig } from "./LlmFieldConfig";

/**
 * Configuration schema for an LLM provider.
 *
 * Defines the fields required to configure a provider instance.
 *
 * @example
 * ```typescript
 * const openaiConfig: LlmProviderConfiguration = {
 *   fields: [
 *     {
 *       id: "apiKey",
 *       type: "secure-text",
 *       label: "API Key",
 *       placeholder: "sk-...",
 *       required: true,
 *       helperText: "Your OpenAI API key"
 *     }
 *   ]
 * };
 * ```
 */
export interface LlmProviderConfiguration {
  /**
   * Array of field configurations that define the form schema.
   * Order matters for UI rendering.
   */
  fields: LlmFieldConfig[];
}
