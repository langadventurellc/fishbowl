/**
 * @fileoverview UUID Validator Creator
 *
 * Creates UUID validators following established patterns from AgentSchema.ts.
 */

import { z } from "zod";

/**
 * Creates a UUID validator following established patterns from AgentSchema.ts
 */
export function createUuidValidator(fieldName = "ID") {
  return z.uuid(`${fieldName} must be a valid UUID`);
}
