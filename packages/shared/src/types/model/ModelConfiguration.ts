import { z } from "zod";

/**
 * @fileoverview Model Configuration Schema
 *
 * Defines the structure for AI model configurations including
 * capabilities, performance characteristics, and operational constraints.
 */

export const ModelConfigurationSchema = z.object({
  /** Unique identifier for the model */
  id: z.string().min(1),
  /** Display name for the model */
  name: z.string().min(1).max(100),
  /** Model provider (e.g., "openai", "anthropic", "google") */
  provider: z.string().min(1),
  /** Model version identifier */
  version: z.string().min(1),
  /** Optional description of model capabilities */
  description: z.string().optional(),
  /** Whether this model is available for use */
  isAvailable: z.boolean().default(true),
  /** Model performance tier */
  tier: z.enum(["basic", "standard", "premium", "enterprise"]),
  /** Creation timestamp */
  createdAt: z.date(),
  /** Last update timestamp */
  updatedAt: z.date(),
});

export type ModelConfiguration = z.infer<typeof ModelConfigurationSchema>;
