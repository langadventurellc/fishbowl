/**
 * Discriminated union schema for all field types.
 *
 * @fileoverview Zod discriminated union schema for LlmFieldConfig
 * @module types/llm-providers/validation/LlmFieldConfigSchema
 */

import { z } from "zod";
import { TextFieldSchema } from "./TextFieldSchema";
import { SecureTextFieldSchema } from "./SecureTextFieldSchema";
import { CheckboxFieldSchema } from "./CheckboxFieldSchema";

/**
 * Discriminated union schema for all field types.
 * Provides efficient type discrimination based on the 'type' field.
 */
export const LlmFieldConfigSchema = z.discriminatedUnion(
  "type",
  [TextFieldSchema, SecureTextFieldSchema, CheckboxFieldSchema],
  {
    message: "Invalid field type. Must be 'text', 'secure-text', or 'checkbox'",
  },
);
