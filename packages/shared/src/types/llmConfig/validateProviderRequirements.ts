import type { Provider } from "./Provider";
import type { ValidationResult } from "./ValidationResult";

/**
 * Validates provider-specific requirements beyond API key
 *
 * @param provider - The provider type
 * @param config - Configuration object with optional fields
 * @returns Validation result with errors array if requirements not met
 */
export function validateProviderRequirements(
  provider: Provider,
  config: { baseUrl?: string },
): ValidationResult {
  const errors: string[] = [];

  switch (provider) {
    case "custom":
      // Custom providers require baseUrl
      if (!config.baseUrl) {
        errors.push("Base URL is required for custom providers");
      } else if (typeof config.baseUrl === "string") {
        // Basic URL validation using try/catch with URL constructor
        try {
          new globalThis.URL(config.baseUrl);
        } catch {
          errors.push("Base URL must be a valid URL");
        }
      }
      break;

    case "openai":
    case "anthropic":
    case "google":
      // Standard providers have default endpoints, baseUrl is optional
      if (config.baseUrl && typeof config.baseUrl === "string") {
        try {
          new globalThis.URL(config.baseUrl);
        } catch {
          errors.push("Base URL must be a valid URL when provided");
        }
      }
      break;

    default:
      errors.push(`Unknown provider: ${provider}`);
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
