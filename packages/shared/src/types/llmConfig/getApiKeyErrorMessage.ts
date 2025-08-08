import type { Provider } from "./Provider";

/**
 * Gets a user-friendly error message for invalid API key formats.
 *
 * @param provider - The provider type
 * @returns Error message string
 */
export function getApiKeyErrorMessage(provider: Provider): string {
  switch (provider) {
    case "openai":
      return 'OpenAI API key must start with "sk-" and be at least 40 characters long';

    case "anthropic":
      return 'Anthropic API key must start with "sk-ant-" and be at least 50 characters long';

    default:
      return "Invalid API key format for the selected provider";
  }
}
