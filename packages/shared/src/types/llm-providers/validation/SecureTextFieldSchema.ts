/**
 * Secure text field configuration schema.
 *
 * @fileoverview Zod schema for SecureTextField interface
 * @module types/llm-providers/validation/SecureTextFieldSchema
 */

import { z } from "zod";
import { BaseFieldConfigSchema } from "./BaseFieldConfigSchema";

/**
 * Secure text field configuration schema.
 * For sensitive data like API keys - no default values allowed.
 */
export const SecureTextFieldSchema = BaseFieldConfigSchema.extend({
  type: z.literal("secure-text", {
    message: "Field type must be 'secure-text'",
  }),

  minLength: z
    .number({ message: "Minimum length must be a number" })
    .int("Minimum length must be a whole number")
    .min(0, "Minimum length cannot be negative")
    .optional(),

  maxLength: z
    .number({ message: "Maximum length must be a number" })
    .int("Maximum length must be a whole number")
    .min(1, "Maximum length must be at least 1")
    .optional(),

  pattern: z.string({ message: "Pattern must be a string" }).optional(),
});
