/**
 * Text field configuration schema.
 *
 * @fileoverview Zod schema for TextField interface
 * @module types/llm-providers/validation/TextFieldSchema
 */

import { z } from "zod";
import { BaseFieldConfigSchema } from "./BaseFieldConfigSchema";

/**
 * Text field configuration schema.
 * Supports general text input with optional validation constraints.
 */
export const TextFieldSchema = BaseFieldConfigSchema.extend({
  type: z.literal("text", {
    message: "Field type must be 'text'",
  }),

  defaultValue: z
    .string({ message: "Default value must be a string" })
    .optional(),

  minLength: z
    .number({ message: "Minimum length must be a number" })
    .int("Minimum length must be a whole number")
    .min(0, "Minimum length cannot be negative")
    .optional(),

  maxLength: z
    .number({ message: "Maximum length must be a number" })
    .int("Maximum length must be a whole number")
    .min(0, "Maximum length must be at least 0")
    .optional(),

  pattern: z.string({ message: "Pattern must be a string" }).optional(),
});
