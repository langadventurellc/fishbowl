import { type StandardizedValidationResult } from "@fishbowl-ai/shared";
import { LlmConfigValidationError } from "./LlmConfigValidationError";

/**
 * Throws validation error if validation result has errors
 *
 * Convenience function for service integration that wants to throw on validation failure.
 * Returns the validated data if successful.
 */
export function throwIfValidationFailed<T>(
  result: StandardizedValidationResult<T>,
): T {
  if (!result.success) {
    throw new LlmConfigValidationError(
      "LLM configuration validation failed",
      result.errors,
    );
  }

  return result.data!;
}
