import type { Provider } from "./Provider";
import type { ValidationResult } from "./ValidationResult";
import { validateApiKeyWithError } from "./validateApiKeyWithError";
import { validateUniqueConfigName } from "./validateUniqueConfigName";
import { validateProviderRequirements } from "./validateProviderRequirements";

interface LlmConfigInput {
  customName: string;
  provider: Provider;
  apiKey: string;
  baseUrl?: string;
}

interface ExistingConfig {
  id: string;
  customName: string;
}

/**
 * Comprehensive validation for LLM configuration
 *
 * @param config - Configuration to validate
 * @param existingConfigs - Existing configurations for uniqueness check
 * @param isUpdate - Whether this is an update operation
 * @returns Validation result with all errors found
 */
export function validateLlmConfig(
  config: LlmConfigInput,
  existingConfigs: ExistingConfig[] = [],
  isUpdate = false,
): ValidationResult {
  const errors: string[] = [];

  // Validate API key
  const apiKeyResult = validateApiKeyWithError(config.apiKey, config.provider);
  if (!apiKeyResult.isValid && apiKeyResult.error) {
    errors.push(apiKeyResult.error);
  }

  // Validate name uniqueness (if not updating or name changed)
  if (!isUpdate) {
    const nameResult = validateUniqueConfigName(
      config.customName,
      existingConfigs.map((c) => c.customName),
    );
    if (!nameResult.isValid && nameResult.error) {
      errors.push(nameResult.error);
    }
  }

  // Validate provider requirements
  const providerResult = validateProviderRequirements(config.provider, config);
  if (!providerResult.isValid && providerResult.errors) {
    errors.push(...providerResult.errors);
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
