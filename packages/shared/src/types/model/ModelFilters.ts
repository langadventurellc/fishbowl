import { z } from "zod";

/**
 * @fileoverview Model Filters Schema
 *
 * Defines filtering criteria for model searches.
 */

export const ModelFiltersSchema = z
  .object({
    /** Filter by model name pattern */
    name: z.string().optional(),
    /** Filter by provider */
    provider: z.string().optional(),
    /** Filter by availability status */
    isAvailable: z.boolean().optional(),
    /** Filter by performance tier */
    tier: z.enum(["basic", "standard", "premium", "enterprise"]).optional(),
    /** Filter by required specializations */
    specializations: z
      .array(
        z.enum([
          "general",
          "coding",
          "analysis",
          "creative",
          "reasoning",
          "multimodal",
        ]),
      )
      .optional(),
    /** Filter by minimum context length */
    minContextLength: z.number().int().positive().optional(),
    /** Filter by maximum cost per token */
    maxCostPerToken: z.number().positive().optional(),
    /** Filter by supported input modalities */
    inputModalities: z
      .array(z.enum(["text", "image", "audio", "video"]))
      .optional(),
    /** Filter by supported output modalities */
    outputModalities: z
      .array(z.enum(["text", "image", "audio", "video"]))
      .optional(),
  })
  .optional();

export type ModelFilters = z.infer<typeof ModelFiltersSchema>;
