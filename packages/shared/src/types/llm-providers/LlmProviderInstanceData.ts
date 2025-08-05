import type { LlmProviderId } from "./LlmProviderId";
import type { LlmConfigurationValues } from "./LlmConfigurationValues";

/**
 * Data required to create a new provider instance.
 *
 * Similar to LlmProviderInstance but without generated fields.
 *
 * @example
 * ```typescript
 * const createData: LlmProviderInstanceData = {
 *   providerId: "openai",
 *   displayName: "My OpenAI Config",
 *   values: {
 *     apiKey: "sk-1234567890abcdef",
 *     baseUrl: "https://api.openai.com/v1",
 *     useAuthHeader: true
 *   }
 * };
 * ```
 *
 * @module types/llm-providers/LlmProviderInstanceData
 */
export interface LlmProviderInstanceData {
  /**
   * Provider type for this configuration.
   */
  providerId: LlmProviderId;

  /**
   * Display name for this configuration.
   */
  displayName: string;

  /**
   * Field values for this configuration.
   */
  values: LlmConfigurationValues;
}
