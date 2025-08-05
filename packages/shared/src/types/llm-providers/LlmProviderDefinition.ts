import type { LlmProviderMetadata } from "./LlmProviderMetadata";
import type { LlmProviderConfiguration } from "./LlmProviderConfiguration";

/**
 * Complete definition of an LLM provider including metadata and configuration.
 *
 * This interface combines the static provider information with its
 * configuration schema, representing the full provider definition
 * as stored in the JSON configuration file.
 *
 * @example
 * ```typescript
 * const anthropicProvider: LlmProviderDefinition = {
 *   id: "anthropic",
 *   name: "Anthropic",
 *   models: {
 *     "claude-3-opus-20240229": "Claude 3 Opus",
 *     "claude-3-sonnet-20240229": "Claude 3 Sonnet"
 *   },
 *   configuration: {
 *     fields: [
 *       {
 *         id: "apiKey",
 *         type: "secure-text",
 *         label: "API Key",
 *         required: true
 *       },
 *       {
 *         id: "baseUrl",
 *         type: "text",
 *         label: "Base URL",
 *         defaultValue: "https://api.anthropic.com"
 *       }
 *     ]
 *   }
 * };
 * ```
 */
export interface LlmProviderDefinition extends LlmProviderMetadata {
  /**
   * Configuration schema defining the fields required to set up this provider.
   */
  configuration: LlmProviderConfiguration;
}
