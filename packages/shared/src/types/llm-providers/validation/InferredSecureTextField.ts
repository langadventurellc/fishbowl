/**
 * Type inference for SecureTextField schema.
 *
 * @fileoverview Inferred type to verify compatibility with SecureTextField interface
 * @module types/llm-providers/validation/InferredSecureTextField
 */

import { z } from "zod";
import { SecureTextFieldSchema } from "./SecureTextFieldSchema";

/**
 * Inferred type from SecureTextFieldSchema to verify compatibility with SecureTextField interface.
 */
export type InferredSecureTextField = z.infer<typeof SecureTextFieldSchema>;
