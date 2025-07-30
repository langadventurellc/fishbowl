export const AVAILABLE_MODELS = [
  {
    value: "Claude 3.5 Sonnet",
    label: "Claude 3.5 Sonnet",
    provider: "Anthropic",
  },
  { value: "GPT-4", label: "GPT-4", provider: "OpenAI" },
  { value: "Claude 3 Haiku", label: "Claude 3 Haiku", provider: "Anthropic" },
  { value: "GPT-3.5 Turbo", label: "GPT-3.5 Turbo", provider: "OpenAI" },
] as const;

export type AvailableModel = (typeof AVAILABLE_MODELS)[number]["value"];
