/**
 * LLM Provider type for supported AI providers.
 */
export type Provider = "openai" | "anthropic" | "google" | "custom";

/**
 * Const array of all valid Provider values for runtime validation
 */
export const PROVIDER_OPTIONS: readonly Provider[] = [
  "openai",
  "anthropic",
  "google",
  "custom",
] as const;
