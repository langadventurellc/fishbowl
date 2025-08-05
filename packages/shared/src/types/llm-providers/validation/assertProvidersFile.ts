/**
 * Type assertion helper for providers file validation.
 *
 * @fileoverview Providers file type assertion utility
 * @module types/llm-providers/validation/assertProvidersFile
 */

import { z } from "zod";
import { LlmProvidersFileSchema } from "./file.schema";

/**
 * Inferred TypeScript type from LlmProvidersFileSchema.
 */
type InferredProvidersFile = z.infer<typeof LlmProvidersFileSchema>;

/**
 * Type assertion helper for providers file validation.
 * Throws a ZodError if the data does not match the schema.
 *
 * @param data - Unknown data to validate and assert
 * @throws {z.ZodError} When validation fails
 *
 * @example
 * ```typescript
 * try {
 *   assertProvidersFile(fileContent);
 *   // TypeScript now knows data is InferredProvidersFile
 *   console.log(fileContent.version);
 * } catch (error) {
 *   console.error('Invalid providers file:', error);
 * }
 * ```
 */
export function assertProvidersFile(
  data: unknown,
): asserts data is InferredProvidersFile {
  LlmProvidersFileSchema.parse(data);
}
