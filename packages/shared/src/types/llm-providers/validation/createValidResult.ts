import type { LlmValidationResult } from "./LlmValidationResult";

/**
 * Creates a valid validation result with no errors.
 *
 * @returns A valid validation result
 *
 * @example
 * ```typescript
 * return createValidResult();
 * ```
 */
export const createValidResult = (): LlmValidationResult => ({
  valid: true,
  errors: [],
});
