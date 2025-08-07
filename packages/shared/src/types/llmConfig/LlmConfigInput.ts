import type { Provider } from "./Provider";

/**
 * Input type for creating or updating LLM configurations.
 * Excludes auto-generated fields like id and timestamps.
 */
export interface LlmConfigInput {
  /** User-defined name for the configuration */
  customName: string;

  /** Provider type */
  provider: Provider;

  /** API key to be encrypted and stored securely */
  apiKey: string;

  /** Optional custom base URL for self-hosted models */
  baseUrl?: string;

  /** Whether to use authorization header for API requests */
  useAuthHeader: boolean;
}
