/**
 * @fileoverview Custom Role Metadata Schema
 *
 * Additional information for role management and tracking.
 */

import { z } from "zod";

/**
 * Custom Role Metadata Schema
 * Additional information for role management and tracking
 */
export const CustomRoleMetadataSchema = z
  .object({
    domain: z.string().optional(),
    complexity: z.enum(["basic", "intermediate", "advanced"]).optional(),
    tags: z.array(z.string()).optional(),
    templateSource: z.string().optional(),
    templateVersion: z.string().optional(),
  })
  .optional();
