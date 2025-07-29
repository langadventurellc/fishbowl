/**
 * @fileoverview Role Filters Schema
 *
 * Criteria for querying and filtering custom roles.
 */

import { z } from "zod";

/**
 * Role Filters Schema
 * Criteria for querying and filtering custom roles
 */
export const RoleFiltersSchema = z
  .object({
    name: z.string().optional(),
    capabilities: z.array(z.string()).optional(),
    isTemplate: z.boolean().optional(),
    domain: z.string().optional(),
    complexity: z.enum(["basic", "intermediate", "advanced"]).optional(),
    tags: z.array(z.string()).optional(),
  })
  .optional();
