/**
 * @fileoverview Agent Core Schema
 *
 * Zod schema definition for agent configuration with comprehensive validation.
 * This defines the complete agent configuration structure for service layer operations.
 */

import { z } from "zod";

/**
 * Agent Core Schema
 * Defines the structure and validation rules for agent configurations
 */
export const AgentSchema = z.object({
  id: z.uuid("Agent ID must be a valid UUID"),
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
  metadata: z.object({
    version: z.string().default("1.0"),
    createdAt: z.date(),
    updatedAt: z.date(),
    isActive: z.boolean().default(true),
    tags: z.array(z.string()).default([]),
  }),
});
