/**
 * LLM Provider type for supported AI providers.
 */
export type Provider = "openai" | "anthropic";

/**
 * Const array of all valid Provider values for runtime validation
 */
export const PROVIDER_OPTIONS: readonly Provider[] = [
  "openai",
  "anthropic",
] as const;
