/**
 * Creates a provider schema with optional custom metadata extensions.
 *
 * @fileoverview Provider schema creation utility
 * @module types/llm-providers/validation/createProviderSchema
 */

import { z } from "zod";
import { LlmProviderConfigSchema } from "./LlmProviderConfigSchema";
import { LlmProviderMetadataSchema } from "./LlmProviderMetadataSchema";

/**
 * Creates a provider schema with optional custom metadata extensions.
 * Allows for provider-specific metadata while maintaining base validation.
 *
 * @param metadataExtensions - Optional metadata schema extensions
 * @returns Provider schema with extended metadata support
 *
 * @example
 * ```typescript
 * // Basic provider schema
 * const BasicProviderSchema = createProviderSchema();
 *
 * // Extended with custom metadata
 * const ExtendedProviderSchema = createProviderSchema({
 *   priority: z.number().min(1).max(10),
 *   category: z.enum(['primary', 'secondary', 'experimental']),
 * });
 * ```
 */
export function createProviderSchema<T extends z.ZodRawShape>(
  metadataExtensions?: T,
) {
  const baseSchema = LlmProviderConfigSchema;
  if (metadataExtensions) {
    return baseSchema.extend({
      metadata: LlmProviderMetadataSchema.extend(metadataExtensions),
    });
  }
  return baseSchema;
}
