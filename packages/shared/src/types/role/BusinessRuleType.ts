/**
 * @fileoverview Business Rule Type
 *
 * TypeScript type for business rule definitions.
 */

import { z } from "zod";
import { BusinessRuleSchema } from "./BusinessRule";

/**
 * Business Rule Type
 */
export type BusinessRule = z.infer<typeof BusinessRuleSchema>;
