import { z } from "zod";
import type { LlmFieldConfig } from "../LlmFieldConfig";
import type { LlmValidationResult } from "./LlmValidationResult";
import { createValidResult } from "./createValidResult";
import { createInvalidResult } from "./createInvalidResult";
import { zodToFieldErrors } from "./zodToFieldErrors";

/**
 * Builds a validation result from a Zod safe parse result.
 *
 * @param zodResult - The result from Zod's safeParse
 * @param fieldConfigs - Optional field configurations for enhanced error messages
 * @returns LLM validation result
 *
 * @example
 * ```typescript
 * const result = schema.safeParse(data);
 * const validationResult = buildValidationResult(result, providerFields);
 * ```
 */
export function buildValidationResult(
  zodResult: { success: boolean; error?: z.ZodError },
  fieldConfigs?: LlmFieldConfig[],
): LlmValidationResult {
  if (zodResult.success) {
    return createValidResult();
  }

  if (!zodResult.error) {
    return createInvalidResult([]);
  }

  return createInvalidResult(zodToFieldErrors(zodResult.error, fieldConfigs));
}
