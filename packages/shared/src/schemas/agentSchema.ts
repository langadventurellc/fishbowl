/**
 * Validation schema for agent creation and editing
 *
 * @module schemas/agentSchema
 */

import { z } from "zod";

export const agentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Agent name is required")
    .max(50, "Agent name must be 50 characters or less")
    .refine(
      (val) => val.trim().length > 0,
      "Agent name cannot be only whitespace",
    ),

  model: z.string().min(1, "Model selection is required"),

  role: z
    .string()
    .trim()
    .min(1, "Role is required")
    .max(100, "Role must be 100 characters or less")
    .refine((val) => val.trim().length > 0, "Role cannot be only whitespace"),

  configuration: z.object({
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

    systemPrompt: z.string().optional(),
  }),
});
