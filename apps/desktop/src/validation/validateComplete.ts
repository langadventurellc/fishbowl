import {
  llmConfigSchema,
  type StandardizedValidationResult,
  formatZodErrors,
  createValidationResult,
  type LlmConfig,
} from "@fishbowl-ai/shared";

/**
 * Validates complete configuration data
 *
 * Validates that a complete configuration object (including system fields)
 * conforms to the full schema.
 */
export function validateComplete(
  config: unknown,
): StandardizedValidationResult<LlmConfig> {
  const schemaResult = llmConfigSchema.safeParse(config);

  if (!schemaResult.success) {
    return createValidationResult<LlmConfig>(
      undefined,
      formatZodErrors(schemaResult.error),
    );
  }

  return createValidationResult(schemaResult.data);
}
