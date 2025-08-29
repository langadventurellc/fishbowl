/**
 * Error class for LLM provider-related failures.
 * Used to wrap and standardize errors from different LLM providers.
 */
export class LlmProviderError extends Error {
  readonly provider?: string;

  /**
   * Create a new LLM provider error.
   * @param message Human-readable error message (sanitized, no API keys or sensitive config)
   * @param provider Optional provider name for debugging context (e.g., 'openai', 'anthropic')
   */
  constructor(message: string, provider?: string) {
    super(message);
    this.name = "LlmProviderError";
    this.provider = provider;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, LlmProviderError.prototype);
  }
}
