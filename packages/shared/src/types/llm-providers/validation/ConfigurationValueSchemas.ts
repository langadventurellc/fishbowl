/**
 * Zod schemas for runtime configuration value validation.
 *
 * Provides Zod schemas for validating configuration values that users
 * input when configuring LLM provider instances.
 *
 * @fileoverview Runtime configuration value schemas
 * @module types/llm-providers/validation/ConfigurationValueSchemas
 */

import { z } from "zod";

// Text field value validation
export const TextFieldValueSchema = z.string();

// Secure text field value validation (same as text)
export const SecureTextFieldValueSchema = z.string();

// Checkbox field value validation
export const CheckboxFieldValueSchema = z.boolean();

// Union of all value types
export const FieldValueSchema = z.union([z.string(), z.boolean()]);

// Configuration values schema - record of field ID to value
export const LlmConfigurationValuesSchema = z.record(
  z.string(), // Field ID
  FieldValueSchema,
);

// Provider instance validation with ISO datetime validation
export const LlmProviderInstanceSchema = z.object({
  id: z.string().min(1),
  providerId: z.string().min(1),
  displayName: z.string().min(1),
  values: LlmConfigurationValuesSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
