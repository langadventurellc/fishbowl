/**
 * @fileoverview Business Rule Schema
 *
 * Business rule definition for role validation.
 */

import { z } from "zod";

/**
 * Business Rule Schema
 * Context information for business rule validation
 */
export const BusinessRuleSchema = z.object({
  id: z.string(),
  description: z.string(),
  validator: z.function(),
});
