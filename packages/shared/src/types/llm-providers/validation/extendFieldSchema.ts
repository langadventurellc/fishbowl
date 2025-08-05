/**
 * Extends the base field schema with custom fields for enhanced validation.
 *
 * @fileoverview Field schema extension utility
 * @module types/llm-providers/validation/extendFieldSchema
 */

import { z } from "zod";
import { LlmFieldConfigSchema } from "./LlmFieldConfigSchema";

/**
 * Extends the base field schema with custom fields for enhanced validation.
 * Enables adding provider-specific or domain-specific field extensions.
 *
 * @param extensions - Object with additional schema properties
 * @returns Extended Zod schema with custom fields
 *
 * @example
 * ```typescript
 * const ExtendedFieldSchema = extendFieldSchema({
 *   customMetadata: z.string().optional(),
 *   validationRules: z.array(z.string()).optional(),
 * });
 *
 * // Use with validation
 * const result = ExtendedFieldSchema.safeParse(fieldData);
 * ```
 */
export function extendFieldSchema<T extends z.ZodRawShape>(extensions: T) {
  return LlmFieldConfigSchema.and(z.object(extensions));
}
