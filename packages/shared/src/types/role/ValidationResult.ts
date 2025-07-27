/**
 * @fileoverview Validation Result Data Model
 *
 * Standard structure for validation operation results across all role operations.
 */

import { z } from "zod";

/**
 * Validation Result Schema
 * Standard structure for validation operation results
 */
export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(
    z.object({
      field: z.string(),
      message: z.string(),
      code: z.string().optional(),
    }),
  ),
});

/**
 * Validation Result Type
 */
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
