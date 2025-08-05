/**
 * Validates unknown data as an LLM providers file.
 *
 * @fileoverview Utility function for validating providers file data
 * @module types/llm-providers/validation/validateProvidersFile
 */

import { LlmProvidersFileSchema } from "./file.schema";

/**
 * Validates unknown data as an LLM providers file.
 * Returns a safe parse result with detailed error information.
 *
 * @param data Unknown data to validate
 * @returns Zod safe parse result
 *
 * @example
 * ```typescript
 * const result = validateProvidersFile(jsonData);
 * if (result.success) {
 *   console.log(`Loaded ${result.data.providers.length} providers`);
 * } else {
 *   console.error(result.error.format());
 * }
 * ```
 */
export function validateProvidersFile(data: unknown) {
  return LlmProvidersFileSchema.safeParse(data);
}
