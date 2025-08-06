/**
 * Configuration metadata for LLM providers.
 * Stored in JSON file alongside encrypted API keys.
 */
export interface LlmConfigMetadata {
  /** Unique identifier linking to secure storage */
  id: string;

  /** User-defined name for the configuration */
  customName: string;

  /** Provider type (e.g., "openai", "anthropic") */
  provider: string;

  /** Optional custom base URL for self-hosted models */
  baseUrl?: string;

  /** Optional auth header type for custom implementations */
  authHeaderType?: string;

  /** ISO timestamp of creation */
  createdAt: string;

  /** ISO timestamp of last update */
  updatedAt: string;
}
