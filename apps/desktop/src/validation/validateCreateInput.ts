import {
  llmConfigInputSchema,
  type StandardizedValidationResult,
  formatZodErrors,
  createValidationResult,
  type LlmConfigInput,
  type LlmConfig,
} from "@fishbowl-ai/shared";
import { validateBusinessRules } from "./validateBusinessRules";

/**
 * Validates input data for creating LLM configuration
 *
 * Combines Zod schema validation with custom business rules validation.
 * Validates API key format, unique configuration names, and provider-specific requirements.
 */
export async function validateCreateInput(
  input: unknown,
  existingConfigs: LlmConfig[] = [],
): Promise<StandardizedValidationResult<LlmConfigInput>> {
  // Step 1: Zod schema validation
  const schemaResult = llmConfigInputSchema.safeParse(input);

  if (!schemaResult.success) {
    return createValidationResult<LlmConfigInput>(
      undefined,
      formatZodErrors(schemaResult.error),
    );
  }

  const validInput = schemaResult.data;

  // Step 2: Custom business rule validation
  const businessRuleErrors = await validateBusinessRules(
    validInput,
    existingConfigs,
  );

  if (businessRuleErrors.length > 0) {
    return createValidationResult<LlmConfigInput>(
      undefined,
      businessRuleErrors,
    );
  }

  return createValidationResult(validInput);
}
