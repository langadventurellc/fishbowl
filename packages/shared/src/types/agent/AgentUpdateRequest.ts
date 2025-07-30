/**
 * @fileoverview Agent Update Request Schema
 *
 * Zod schema for agent update requests.
 */

import { z } from "zod";

/**
 * Agent Update Request Schema
 */
export const AgentUpdateRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Agent name is required")
    .max(100, "Agent name too long")
    .optional(),
  description: z.string().optional(),
  role: z.string().min(1, "Agent role is required").optional(),
  personalityId: z
    .string()
    .uuid("Personality ID must be a valid UUID")
    .optional(),
  modelId: z.string().min(1, "Model ID is required").optional(),
  capabilities: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});
