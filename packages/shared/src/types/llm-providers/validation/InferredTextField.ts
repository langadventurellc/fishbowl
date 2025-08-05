/**
 * Type inference for TextField schema.
 *
 * @fileoverview Inferred type to verify compatibility with TextField interface
 * @module types/llm-providers/validation/InferredTextField
 */

import { z } from "zod";
import { TextFieldSchema } from "./TextFieldSchema";

/**
 * Inferred type from TextFieldSchema to verify compatibility with TextField interface.
 */
export type InferredTextField = z.infer<typeof TextFieldSchema>;
