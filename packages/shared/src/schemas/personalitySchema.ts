/**
 * Validation schema for personality creation and editing
 *
 * @module schemas/personalitySchema
 */

import { z } from "zod";

export const personalitySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
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
