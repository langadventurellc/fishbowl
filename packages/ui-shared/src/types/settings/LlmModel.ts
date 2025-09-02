/**
 * Represents a specific LLM model available from a configured provider.
 * Used by ModelSelect component to display available models to users.
 */
export interface LlmModel {
  /** Unique identifier for the model (typically the model name) */
  id: string;

  /** Human-readable display name for the model */
  name: string;

  /** Provider that offers this model (OpenAI, Anthropic, etc.) */
  provider: string;

  /** Configuration identifier for lookup */
  configId: string;

  /** Display label for this configuration (customName || provider) */
  configLabel: string;

  /** Context window size in tokens */
  contextLength: number;
}
