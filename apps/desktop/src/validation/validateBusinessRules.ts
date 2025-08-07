import {
  type ValidationError,
  ValidationErrorCode,
  createValidationError,
  validateApiKey,
  validateUniqueConfigName,
  validateProviderRequirements,
  getApiKeyErrorMessage,
  type LlmConfigInput,
  type LlmConfig,
} from "@fishbowl-ai/shared";

/**
 * Validates API key format for the specified provider
 */
function validateApiKeyFormat(config: LlmConfigInput): ValidationError | null {
  if (!validateApiKey(config.apiKey, config.provider)) {
    return createValidationError(
      "apiKey",
      ValidationErrorCode.API_KEY_FORMAT,
      getApiKeyErrorMessage(config.provider),
      "[HIDDEN]", // Never expose actual API key
    );
  }
  return null;
}

/**
 * Validates that configuration name is unique
 */
function validateConfigNameUniqueness(
  config: LlmConfigInput,
  existingConfigs: LlmConfig[],
  currentId?: string,
  currentName?: string,
): ValidationError | null {
  const existingNames = existingConfigs
    .filter((c) => c.id !== currentId)
    .map((c) => c.customName);

  const nameValidation = validateUniqueConfigName(
    config.customName,
    existingNames,
    currentId,
    currentName,
  );

  if (!nameValidation.isValid) {
    return createValidationError(
      "customName",
      ValidationErrorCode.DUPLICATE_NAME,
      nameValidation.error!,
      config.customName,
    );
  }

  return null;
}

/**
 * Validates provider-specific requirements
 */
function validateProviderSpecificRules(
  config: LlmConfigInput,
): ValidationError[] {
  const errors: ValidationError[] = [];

  const providerValidation = validateProviderRequirements(
    config.provider,
    config,
  );

  if (!providerValidation.isValid && providerValidation.errors) {
    for (const error of providerValidation.errors) {
      errors.push(
        createValidationError(
          "provider",
          ValidationErrorCode.PROVIDER_SPECIFIC,
          error,
          config.provider,
        ),
      );
    }
  }

  return errors;
}

/**
 * Applies all custom business rules validation
 *
 * Validates:
 * - API key format per provider
 * - Unique configuration names
 * - Provider-specific requirements
 */
export async function validateBusinessRules(
  config: LlmConfigInput,
  existingConfigs: LlmConfig[] = [],
  currentId?: string,
  currentName?: string,
): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  // API key format validation
  const apiKeyError = validateApiKeyFormat(config);
  if (apiKeyError) {
    errors.push(apiKeyError);
  }

  // Unique name validation
  const nameError = validateConfigNameUniqueness(
    config,
    existingConfigs,
    currentId,
    currentName,
  );
  if (nameError) {
    errors.push(nameError);
  }

  // Provider-specific requirements
  const providerErrors = validateProviderSpecificRules(config);
  errors.push(...providerErrors);

  return errors;
}
