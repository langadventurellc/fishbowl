/**
 * Base field configuration schema shared by all field types.
 *
 * @fileoverview Zod schema for BaseFieldConfig interface
 * @module types/llm-providers/validation/BaseFieldConfigSchema
 */

import { z } from "zod";

/**
 * Base field configuration schema shared by all field types.
 * Matches BaseFieldConfig interface exactly.
 */
export const BaseFieldConfigSchema = z.object({
  id: z
    .string({ message: "Field ID must be a string" })
    .min(1, "Field ID is required"),

  label: z
    .string({ message: "Field label must be a string" })
    .min(1, "Field label is required"),

  placeholder: z.string({ message: "Placeholder must be a string" }).optional(),

  required: z.boolean({
    message: "Required must be a boolean",
  }),

  helperText: z.string({ message: "Helper text must be a string" }).optional(),
});
