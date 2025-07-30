import { z } from "zod";

/**
 * @fileoverview Model Constraints Schema
 *
 * Defines operational constraints for model usage.
 */

export const ModelConstraintsSchema = z.object({
  /** Maximum cost per interaction */
  maxCostPerInteraction: z.number().positive().optional(),
  /** Maximum response time in milliseconds */
  maxResponseTime: z.number().int().positive().optional(),
  /** Required input modalities */
  requiredInputModalities: z
    .array(z.enum(["text", "image", "audio", "video"]))
    .optional(),
  /** Required output modalities */
  requiredOutputModalities: z
    .array(z.enum(["text", "image", "audio", "video"]))
    .optional(),
  /** Minimum context length required */
  minContextLength: z.number().int().positive().optional(),
  /** Required specializations */
  requiredSpecializations: z
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
  /** Security constraints */
  security: z
    .object({
      /** Require on-premise deployment */
      requireOnPremise: z.boolean().default(false),
      /** Require data retention compliance */
      requireDataRetention: z.boolean().default(false),
      /** Allowed regions for processing */
      allowedRegions: z.array(z.string()).optional(),
    })
    .optional(),
});

export type ModelConstraints = z.infer<typeof ModelConstraintsSchema>;
