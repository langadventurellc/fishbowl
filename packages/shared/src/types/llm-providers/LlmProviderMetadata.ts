import type { LlmProviderId } from "./LlmProviderId";

/**
 * Metadata for an LLM provider including identification and available models.
 *
 * This interface defines the static information about a provider that doesn't
 * change between different configurations of the same provider type.
 *
 * @example
 * ```typescript
 * const openaiMetadata: LlmProviderMetadata = {
 *   id: "openai",
 *   name: "OpenAI",
 *   models: {
 *     "gpt-4": "GPT-4",
 *     "gpt-3.5-turbo": "GPT-3.5 Turbo"
 *   }
 * };
 * ```
 */
export interface LlmProviderMetadata {
  /**
   * Unique identifier for the provider type.
   * Used as a key in configuration storage and UI routing.
   *
   * @example "openai", "anthropic", "ollama"
   */
  id: LlmProviderId;

  /**
   * Display name for the provider shown in UI.
   *
   * @example "OpenAI", "Anthropic", "Ollama"
   */
  name: string;

  /**
   * Mapping of model IDs to their display names.
   * Keys are the API model identifiers, values are user-friendly names.
   *
   * @example
   * ```typescript
   * {
   *   "gpt-4": "GPT-4",
   *   "gpt-3.5-turbo": "GPT-3.5 Turbo"
   * }
   * ```
   */
  models: Record<string, string>;
}
