/**
 * @fileoverview Agent Create Request Schema
 *
 * Zod schema for agent creation requests.
 */

import { z } from "zod";

/**
 * Agent Create Request Schema
 */
export const AgentCreateRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Agent name is required")
    .max(100, "Agent name too long"),
  description: z.string().optional(),
  role: z.string().min(1, "Agent role is required"),
  personalityId: z.uuid("Personality ID must be a valid UUID"),
  modelId: z.string().min(1, "Model ID is required"),
  capabilities: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  settings: z.record(z.string(), z.unknown()).default({}),
  tags: z.array(z.string()).default([]),
});
