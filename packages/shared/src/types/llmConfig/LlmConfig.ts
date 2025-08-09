import type { Provider } from "./Provider";

/**
 * Complete LLM configuration including decrypted API key.
 * This type is used when reading configurations from the repository
 * where the API key has been decrypted from secure storage.
 */
export interface LlmConfig {
  /** Unique identifier linking to secure storage */
  id: string;

  /** User-defined name for the configuration */
  customName: string;

  /** Provider type */
  provider: Provider;

  /** Decrypted API key from secure storage */
  apiKey: string;

  /** Optional custom base URL for self-hosted models */
  baseUrl?: string;

  /** Whether to use authorization header for API requests */
  useAuthHeader: boolean;

  /** ISO timestamp of creation */
  createdAt: string;

  /** ISO timestamp of last update */
  updatedAt: string;
}
