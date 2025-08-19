/**
 * Validation schema for agent creation and editing
 *
 * @module schemas/agentSchema
 */

import { z } from "zod";

export const agentSchema = z.object({
  name: z
    .string()
    .min(1, "Agent name is required")
    .max(100, "Name must be 100 characters or less")
    .min(2, "Name must be at least 2 characters")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Name can only contain letters, numbers, spaces, hyphens, and underscores",
    )
    .refine((val) => val.trim().length > 0, "Name cannot be only whitespace"),
  model: z.string().min(1, "Model is required"),
  role: z.string().min(1, "Role is required"),
  personality: z.string().min(1, "Personality is required"),
  temperature: z
    .number()
    .min(0, "Temperature must be between 0 and 2")
    .max(2, "Temperature must be between 0 and 2"),
  maxTokens: z
    .number()
    .int("Max tokens must be a whole number")
    .min(1, "Max tokens must be at least 1")
    .max(4000, "Max tokens must be 4000 or less"),
  topP: z
    .number()
    .min(0, "Top P must be between 0 and 1")
    .max(1, "Top P must be between 0 and 1"),
  systemPrompt: z
    .string()
    .max(5000, "System prompt must be 5000 characters or less")
    .optional(),
});
