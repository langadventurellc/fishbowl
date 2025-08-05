/**
 * Type inference for CheckboxField schema.
 *
 * @fileoverview Inferred type to verify compatibility with CheckboxField interface
 * @module types/llm-providers/validation/InferredCheckboxField
 */

import { z } from "zod";
import { CheckboxFieldSchema } from "./CheckboxFieldSchema";

/**
 * Inferred type from CheckboxFieldSchema to verify compatibility with CheckboxField interface.
 */
export type InferredCheckboxField = z.infer<typeof CheckboxFieldSchema>;
