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
  // LLM configuration identifier - OPTIONAL initially for gradual migration
  llmConfigId: z
    .string({ message: "LLM Configuration ID must be a string" })
    .min(1, "LLM Configuration is required")
    .refine(
      (val) => val.trim().length > 0,
      "LLM Configuration ID cannot be only whitespace",
    ),
  role: z.string().min(1, "Role is required"),
  personality: z.string().min(1, "Personality is required"),
  systemPrompt: z
    .string()
    .max(5000, "System prompt must be 5000 characters or less")
    .optional(),
});
