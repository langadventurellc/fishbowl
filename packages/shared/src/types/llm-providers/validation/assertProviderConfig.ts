/**
 * Type assertion helper for provider configuration validation.
 *
 * @fileoverview Provider configuration type assertion utility
 * @module types/llm-providers/validation/assertProviderConfig
 */

import { z } from "zod";
import { LlmProviderConfigSchema } from "./LlmProviderConfigSchema";

/**
 * Inferred TypeScript type from LlmProviderConfigSchema.
 */
type InferredProviderConfig = z.infer<typeof LlmProviderConfigSchema>;

/**
 * Type assertion helper for provider configuration validation.
 * Throws a ZodError if the data does not match the schema.
 *
 * @param data - Unknown data to validate and assert
 * @throws {z.ZodError} When validation fails
 *
 * @example
 * ```typescript
 * try {
 *   assertProviderConfig(unknownData);
 *   // TypeScript now knows data is InferredProviderConfig
 *   console.log(unknownData.name);
 * } catch (error) {
 *   console.error('Invalid provider config:', error);
 * }
 * ```
 */
export function assertProviderConfig(
  data: unknown,
): asserts data is InferredProviderConfig {
  LlmProviderConfigSchema.parse(data);
}
