import type { Provider } from "./Provider";

/**
 * Configuration metadata for LLM providers.
 * Stored in JSON file alongside encrypted API keys in secure storage.
 */
export interface LlmConfigMetadata {
  /** Unique identifier linking to secure storage */
  id: string;

  /** User-defined name for the configuration */
  customName: string;

  /** Provider type */
  provider: Provider;

  /** Optional custom base URL for self-hosted models */
  baseUrl?: string;

  /** Whether to use authorization header for API requests */
  useAuthHeader: boolean;

  /** ISO timestamp of creation */
  createdAt: string;

  /** ISO timestamp of last update */
  updatedAt: string;
}
