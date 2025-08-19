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

  /** Context window size in tokens */
  contextLength: number;

  /** Whether the model supports vision/image input */
  vision: boolean;

  /** Whether the model supports function calling */
  functionCalling: boolean;
}
