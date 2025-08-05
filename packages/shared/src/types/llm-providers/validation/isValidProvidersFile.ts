/**
 * Type guard to check if data is a valid providers file.
 *
 * @fileoverview Type guard utility for providers file validation
 * @module types/llm-providers/validation/isValidProvidersFile
 */

import { z } from "zod";
import { LlmProvidersFileSchema } from "./file.schema";

/**
 * Type guard to check if data is a valid providers file.
 *
 * @param data Unknown data to check
 * @returns True if data is a valid providers file
 */
export function isValidProvidersFile(
  data: unknown,
): data is z.infer<typeof LlmProvidersFileSchema> {
  return LlmProvidersFileSchema.safeParse(data).success;
}
