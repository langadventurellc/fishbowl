import type { ProviderConfig } from "./providerConfig";

/**
 * Predefined provider configurations for supported AI providers.
 * Each provider includes specific validation rules and default settings.
 */
export const PROVIDERS: Record<string, ProviderConfig> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    defaultBaseUrl: "https://api.openai.com/v1",
    apiKeyValidation: {
      minLength: 20,
      pattern: /^sk-[a-zA-Z0-9]{20,}$/,
      placeholder: "Enter your OpenAI API key",
    },
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    apiKeyValidation: {
      minLength: 20,
      pattern: /^sk-ant-[a-zA-Z0-9\-_]{20,}$/,
      placeholder: "Enter your Anthropic API key",
    },
  },
} as const;
