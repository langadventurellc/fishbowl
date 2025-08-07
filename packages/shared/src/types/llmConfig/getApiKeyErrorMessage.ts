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
      return "OpenAI API key must start with 'sk-' and be longer than 40 characters";

    case "anthropic":
      return "Anthropic API key must start with 'sk-ant-' and be longer than 50 characters";

    case "google":
      return "Google API key must be a valid format (39 characters starting with 'AIza')";

    case "custom":
      return "API key is required";

    default:
      return "Invalid API key format for the selected provider";
  }
}
