import { z } from "zod";

/**
 * @fileoverview Compatibility Result Schema
 *
 * Defines the structure for cross-service compatibility analysis results.
 */

export const CompatibilityResultSchema = z.object({
  /** Whether the combination is compatible */
  isCompatible: z.boolean(),
  /** Compatibility score (0-100) */
  compatibilityScore: z.number().min(0).max(100),
  /** Detailed compatibility analysis */
  analysis: z.object({
    /** Model capability alignment with personality requirements */
    personalityAlignment: z.object({
      score: z.number().min(0).max(100),
      issues: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
    /** Model capability alignment with role requirements */
    roleAlignment: z.object({
      score: z.number().min(0).max(100),
      issues: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
    /** Performance considerations */
    performance: z.object({
      expectedResponseTime: z.number().positive(),
      estimatedCost: z.number().positive(),
      resourceRequirements: z.array(z.string()),
    }),
    /** Risk factors */
    risks: z.array(
      z.object({
        type: z.enum(["performance", "cost", "capability", "compatibility"]),
        severity: z.enum(["low", "medium", "high", "critical"]),
        description: z.string(),
        mitigation: z.string().optional(),
      }),
    ),
  }),
  /** Overall recommendations */
  recommendations: z.array(z.string()),
  /** Alternative model suggestions */
  alternatives: z.array(
    z.object({
      modelId: z.string(),
      reason: z.string(),
      improvementScore: z.number().min(0).max(100),
    }),
  ),
});

export type CompatibilityResult = z.infer<typeof CompatibilityResultSchema>;
