/**
 * Enhanced field config schema with cross-field validation refinements.
 *
 * @fileoverview Enhanced schema with business logic validation
 * @module types/llm-providers/validation/LlmFieldConfigSchemaWithRefinements
 */

import { z } from "zod";
import { LlmFieldConfigSchema } from "./LlmFieldConfigSchema";

/**
 * Enhanced schema with cross-field validation refinements.
 * Adds business logic validation that spans multiple fields.
 */
export const LlmFieldConfigSchemaWithRefinements =
  LlmFieldConfigSchema.superRefine((data, ctx) => {
    // Validate minLength <= maxLength for text fields
    if (
      (data.type === "text" || data.type === "secure-text") &&
      data.minLength !== undefined &&
      data.maxLength !== undefined &&
      data.minLength > data.maxLength
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimum length cannot be greater than maximum length",
        path: ["minLength"],
      });
    }

    // Validate pattern is a valid regular expression
    if ((data.type === "text" || data.type === "secure-text") && data.pattern) {
      try {
        new RegExp(data.pattern);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Pattern must be a valid regular expression",
          path: ["pattern"],
        });
      }
    }
  });
