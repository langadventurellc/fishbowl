/**
 * Validation schema for personality creation and editing
 *
 * @module schemas/personalitySchema
 */

import { z } from "zod";
import { isDiscreteValue } from "@fishbowl-ai/shared";

const discreteNumber = z
  .number()
  .min(0)
  .max(100)
  .refine(isDiscreteValue, "Must be one of 0, 20, 40, 60, 80, 100");

export const personalitySchema = z
  .object({
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
    behaviors: z.record(z.string(), discreteNumber),
    customInstructions: z.string().max(500, "Instructions too long"),
  })
  .strict();
