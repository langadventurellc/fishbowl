import type { LlmConfigInput } from "./LlmConfigInput";
import type { StandardizedValidationResult } from "./StandardizedValidationResult";
import { llmConfigInputSchema } from "./llmConfigInputSchema";
import { formatZodErrors } from "../../validation/formatZodErrors";
import { createValidationResult } from "./createValidationResult";
import { createValidationError } from "./createValidationError";
import { ValidationErrorCode } from "./ValidationErrorCode";
import { validateApiKey } from "./validateApiKey";
import { getApiKeyErrorMessage } from "./getApiKeyErrorMessage";

/**
 * Validates LLM configuration with comprehensive error handling
 */
export function validateWithErrors(
  data: unknown,
  existingNames: string[] = [],
): StandardizedValidationResult<LlmConfigInput> {
  // Phase 1: Schema validation
  const schemaResult = llmConfigInputSchema.safeParse(data);

  if (!schemaResult.success) {
    const errors = formatZodErrors(schemaResult.error);
    return createValidationResult<LlmConfigInput>(undefined, errors);
  }

  const validData = schemaResult.data;
  const additionalErrors = [];

  // Phase 2: Business rule validation

  // Check for duplicate names
  if (existingNames.includes(validData.customName)) {
    additionalErrors.push(
      createValidationError(
        "customName",
        ValidationErrorCode.DUPLICATE_NAME,
        `Configuration name "${validData.customName}" already exists`,
        validData.customName,
      ),
    );
  }

  // Enhanced API key validation
  if (!validateApiKey(validData.apiKey, validData.provider)) {
    additionalErrors.push(
      createValidationError(
        "apiKey",
        ValidationErrorCode.API_KEY_FORMAT,
        getApiKeyErrorMessage(validData.provider),
        "[REDACTED]",
      ),
    );
  }

  if (additionalErrors.length > 0) {
    return createValidationResult<LlmConfigInput>(undefined, additionalErrors);
  }

  return createValidationResult(validData);
}
