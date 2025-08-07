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
 * Validates input data for updating LLM configuration
 *
 * Handles partial updates by merging with current configuration for context.
 * Validates that business rules are still satisfied after the update.
 */
export async function validateUpdateInput(
  input: unknown,
  currentConfig: LlmConfig,
  existingConfigs: LlmConfig[] = [],
): Promise<StandardizedValidationResult<Partial<LlmConfigInput>>> {
  // Create partial schema for updates
  const partialSchema = llmConfigInputSchema.partial();
  const schemaResult = partialSchema.safeParse(input);

  if (!schemaResult.success) {
    return createValidationResult<Partial<LlmConfigInput>>(
      undefined,
      formatZodErrors(schemaResult.error),
    );
  }

  const validInput = schemaResult.data;

  // Merge with current config for full validation context
  const mergedConfig = { ...currentConfig, ...validInput };

  // Custom business rule validation
  const businessRuleErrors = await validateBusinessRules(
    mergedConfig,
    existingConfigs,
    currentConfig.id,
    currentConfig.customName,
  );

  if (businessRuleErrors.length > 0) {
    return createValidationResult<Partial<LlmConfigInput>>(
      undefined,
      businessRuleErrors,
    );
  }

  return createValidationResult(validInput);
}
