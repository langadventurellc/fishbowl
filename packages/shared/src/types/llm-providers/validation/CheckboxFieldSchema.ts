/**
 * Checkbox field configuration schema.
 *
 * @fileoverview Zod schema for CheckboxField interface
 * @module types/llm-providers/validation/CheckboxFieldSchema
 */

import { z } from "zod";
import { BaseFieldConfigSchema } from "./BaseFieldConfigSchema";

/**
 * Checkbox field configuration schema.
 * For boolean toggle fields with optional default state.
 */
export const CheckboxFieldSchema = BaseFieldConfigSchema.extend({
  type: z.literal("checkbox", {
    message: "Field type must be 'checkbox'",
  }),

  defaultValue: z
    .boolean({
      message: "Default value must be a boolean",
    })
    .optional(),
});
