/**
 * Validation schema for role creation and editing
 *
 * @module schemas/roleSchema
 */

import { z } from "zod";

export const roleSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(50, "Name must be 50 characters or less")
    .min(2, "Name must be at least 2 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Name can only contain letters, numbers, spaces, hyphens, and underscores",
    )
    .refine((val) => val.trim().length > 0, "Name cannot be only whitespace"),
  description: z
    .string()
    .min(1, "Role description is required")
    .max(200, "Description must be 200 characters or less")
    .refine(
      (val) => val.trim().length > 0,
      "Description cannot be only whitespace",
    ),
  systemPrompt: z
    .string()
    .min(1, "System prompt is required")
    .max(2000, "System prompt must be 2000 characters or less")
    .refine(
      (val) => val.trim().length > 0,
      "System prompt cannot be only whitespace",
    )
    .optional(),
});
