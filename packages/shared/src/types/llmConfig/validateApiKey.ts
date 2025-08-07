import type { Provider } from "./Provider";

/**
 * Validates API key format based on provider requirements.
 *
 * @param apiKey - The API key to validate
 * @param provider - The provider type
 * @returns true if valid, false otherwise
 */
export function validateApiKey(apiKey: string, provider: Provider): boolean {
  switch (provider) {
    case "openai":
      return apiKey.startsWith("sk-") && apiKey.length >= 40;

    case "anthropic":
      return apiKey.startsWith("sk-ant-") && apiKey.length >= 50;

    case "google":
      // Google API keys are typically 35-45 characters, alphanumeric with underscores/hyphens
      return /^[A-Za-z0-9_-]{35,45}$/.test(apiKey);

    case "custom":
      // For custom providers, any non-empty key is valid
      return apiKey.length > 0;

    default:
      return false;
  }
}
