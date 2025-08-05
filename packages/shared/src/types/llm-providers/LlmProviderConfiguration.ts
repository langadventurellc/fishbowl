/**
 * Configuration schema for an LLM provider.
 *
 * Defines the fields required to configure a provider instance.
 * The fields array will contain field configuration objects defined
 * in the field.types.ts file.
 *
 * @example
 * ```typescript
 * const openaiConfig: LlmProviderConfiguration = {
 *   fields: [
 *     {
 *       id: "apiKey",
 *       type: "secure-text",
 *       label: "API Key",
 *       required: true
 *     }
 *   ]
 * };
 * ```
 */
export interface LlmProviderConfiguration {
  /**
   * Array of field configurations that define the form schema.
   * Order matters for UI rendering.
   *
   * Note: LlmFieldConfig type will be defined in field.types.ts
   */
  fields: Array<{
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    helperText?: string;
    defaultValue?: unknown;
  }>; // Will be replaced with LlmFieldConfig[] after field types are defined
}
