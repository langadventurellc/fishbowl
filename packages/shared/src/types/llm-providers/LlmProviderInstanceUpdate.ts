import type { LlmConfigurationValues } from "./LlmConfigurationValues";

/**
 * Partial update data for modifying existing provider instances.
 *
 * Allows updating specific fields without requiring all data.
 * The ID and timestamps are managed by the storage layer.
 *
 * @example
 * ```typescript
 * const update: LlmProviderInstanceUpdate = {
 *   displayName: "Updated ChatGPT Config",
 *   values: {
 *     baseUrl: "https://api.openai.com/v2"
 *   }
 * };
 * ```
 *
 * @module types/llm-providers/LlmProviderInstanceUpdate
 */
export interface LlmProviderInstanceUpdate {
  /**
   * Updated display name for the configuration.
   */
  displayName?: string;

  /**
   * Updated field values. Merged with existing values.
   */
  values?: Partial<LlmConfigurationValues>;
}
