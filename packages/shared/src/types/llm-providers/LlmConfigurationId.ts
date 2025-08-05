/**
 * Unique identifier for a provider configuration instance.
 *
 * Branded string type to prevent mixing with other ID types.
 *
 * @example "config_1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
 *
 * @module types/llm-providers/LlmConfigurationId
 */
export type LlmConfigurationId = string & {
  readonly __brand: "LlmConfigurationId";
};
