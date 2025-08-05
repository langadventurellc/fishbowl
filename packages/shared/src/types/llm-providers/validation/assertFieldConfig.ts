/**
 * Type assertion helper for field configuration validation.
 *
 * @fileoverview Field configuration type assertion utility
 * @module types/llm-providers/validation/assertFieldConfig
 */

import { z } from "zod";
import { LlmFieldConfigSchema } from "./LlmFieldConfigSchema";

/**
 * Inferred TypeScript type from LlmFieldConfigSchema.
 */
type InferredFieldConfig = z.infer<typeof LlmFieldConfigSchema>;

/**
 * Type assertion helper for field configuration validation.
 * Throws a ZodError if the data does not match the schema.
 *
 * @param data - Unknown data to validate and assert
 * @throws {z.ZodError} When validation fails
 *
 * @example
 * ```typescript
 * try {
 *   assertFieldConfig(unknownData);
 *   // TypeScript now knows data is InferredFieldConfig
 *   console.log(unknownData.type);
 * } catch (error) {
 *   console.error('Invalid field config:', error);
 * }
 * ```
 */
export function assertFieldConfig(
  data: unknown,
): asserts data is InferredFieldConfig {
  LlmFieldConfigSchema.parse(data);
}
