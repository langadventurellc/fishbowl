/**
 * Legacy LLM configuration data format.
 *
 * This interface represents the legacy format used by the existing
 * LLM configuration system before the dynamic provider system.
 *
 * @deprecated This format will be replaced by the new dynamic provider system.
 * Use for backward compatibility only.
 *
 * @example
 * ```typescript
 * const legacyConfig: LegacyLlmConfigData = {
 *   customName: "My OpenAI",
 *   apiKey: "sk-...",
 *   baseUrl: "https://api.openai.com/v1",
 *   useAuthHeader: true
 * };
 * ```
 */
export interface LegacyLlmConfigData {
  /**
   * User-defined display name for the configuration.
   */
  customName: string;

  /**
   * API key for authentication.
   */
  apiKey: string;

  /**
   * Base URL for the API endpoint.
   */
  baseUrl: string;

  /**
   * Whether to use authorization header for authentication.
   */
  useAuthHeader: boolean;
}
