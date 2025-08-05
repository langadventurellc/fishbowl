import type { LlmProviderId } from "./LlmProviderId";
import type { LlmConfigurationId } from "./LlmConfigurationId";
import type { LlmConfigurationValues } from "./LlmConfigurationValues";

/**
 * Runtime instance of an LLM provider configuration.
 *
 * Represents a complete, configured provider instance with metadata,
 * field values, and lifecycle timestamps.
 *
 * @example
 * ```typescript
 * const instance: LlmProviderInstance = {
 *   id: "config_1a2b3c4d" as LlmConfigurationId,
 *   providerId: "openai",
 *   displayName: "My ChatGPT API",
 *   values: {
 *     apiKey: "sk-1234567890abcdef",
 *     baseUrl: "https://api.openai.com/v1",
 *     useAuthHeader: true
 *   },
 *   createdAt: "2024-01-15T10:30:00.000Z",
 *   updatedAt: "2024-01-15T10:30:00.000Z"
 * };
 * ```
 *
 * @module types/llm-providers/LlmProviderInstance
 */
export interface LlmProviderInstance {
  /**
   * Unique identifier for this configuration instance.
   * Used for storage keys and UI routing.
   */
  id: LlmConfigurationId;

  /**
   * References the provider type this configuration is for.
   * Must match a provider ID from the provider metadata.
   */
  providerId: LlmProviderId;

  /**
   * User-defined display name for this configuration.
   * Shown in UI to distinguish multiple configs of the same provider.
   */
  displayName: string;

  /**
   * Field values for this configuration instance.
   * Structure depends on the provider's field configuration.
   */
  values: LlmConfigurationValues;

  /**
   * ISO timestamp when this configuration was first created.
   */
  createdAt: string;

  /**
   * ISO timestamp when this configuration was last modified.
   */
  updatedAt: string;
}
