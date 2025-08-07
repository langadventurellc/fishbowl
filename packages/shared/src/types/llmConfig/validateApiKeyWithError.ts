import type { Provider } from "./Provider";
import { validateApiKey } from "./validateApiKey";
import { getApiKeyErrorMessage } from "./getApiKeyErrorMessage";
import type { ValidationResult } from "./ValidationResult";

/**
 * Enhanced API key validation with detailed error messages
 *
 * @param apiKey - The API key to validate
 * @param provider - The provider type
 * @returns Validation result with error message if invalid
 */
export function validateApiKeyWithError(
  apiKey: string,
  provider: Provider,
): ValidationResult {
  if (!apiKey || typeof apiKey !== "string") {
    return {
      isValid: false,
      error: "API key must be a non-empty string",
    };
  }

  const isValid = validateApiKey(apiKey, provider);
  if (!isValid) {
    return {
      isValid: false,
      error: getApiKeyErrorMessage(provider),
    };
  }

  return { isValid: true };
}
