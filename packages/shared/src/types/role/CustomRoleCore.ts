/**
 * @fileoverview Core Custom Role Schema
 *
 * Complete definition of a custom role with all required and optional fields.
 */

import { z } from "zod";
import { CustomRoleCapabilitySchema } from "./CustomRoleCapability";
import { CustomRoleConstraintSchema } from "./CustomRoleConstraint";
import { CustomRoleMetadataSchema } from "./CustomRoleMetadata";

/**
 * Core Custom Role Schema
 * Complete definition of a custom role with all required and optional fields
 */
export const CustomRoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  capabilities: z.array(CustomRoleCapabilitySchema).min(1),
  constraints: z.array(CustomRoleConstraintSchema),
  isTemplate: z.boolean().default(false),
  templateId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.number().int().positive(),
  metadata: CustomRoleMetadataSchema,
});
