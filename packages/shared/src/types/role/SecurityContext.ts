/**
 * @fileoverview Security Context Schema
 *
 * Security context for capability and constraint validation.
 */

import { z } from "zod";

/**
 * Security Context Schema
 * Security context for capability and constraint validation
 */
export const SecurityContextSchema = z.object({
  userId: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  roles: z.array(z.string()).optional(),
  sessionId: z.string().optional(),
  maxCapabilities: z.number().int().positive().optional(),
  allowedDomains: z.array(z.string()).optional(),
});
