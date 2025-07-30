/**
 * Validation schema for personality creation and editing
 *
 * @module schemas/personalitySchema
 */

import { z } from "zod";

export const personalitySchema = z.object({
  name: z
    .string()
    .min(1, "Personality name is required")
    .max(50, "Name must be 50 characters or less")
    .min(2, "Name must be at least 2 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Name can only contain letters, numbers, spaces, hyphens, and underscores",
    )
    .refine((val) => val.trim().length > 0, "Name cannot be only whitespace"),
  bigFive: z.object({
    openness: z.number().min(0).max(100),
    conscientiousness: z.number().min(0).max(100),
    extraversion: z.number().min(0).max(100),
    agreeableness: z.number().min(0).max(100),
    neuroticism: z.number().min(0).max(100),
  }),
  behaviors: z.record(z.string(), z.number().min(0).max(100)),
  customInstructions: z.string().max(500, "Instructions too long"),
});
