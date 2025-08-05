/**
 * JSON file format schema for LLM provider configurations.
 *
 * @fileoverview Zod schema for complete LLM provider file validation
 * @module types/llm-providers/validation/file.schema
 */

import { z } from "zod";
import { LlmProviderConfigSchema } from "./LlmProviderConfigSchema";
import { isValidSchemaVersion } from "../../../services/storage/utils/isValidSchemaVersion";

/**
 * Current schema version for LLM provider configuration files.
 * Uses semantic versioning for future migration support.
 */
export const LLM_PROVIDERS_SCHEMA_VERSION = "1.0.0";

/**
 * Metadata schema for provider configuration files.
 * Tracks file-level information for auditing and documentation.
 */
const LlmProvidersFileMetadataSchema = z
  .object({
    lastUpdated: z
      .string()
      .datetime("Last updated must be a valid ISO datetime")
      .optional(),
    description: z.string().optional(),
  })
  .optional();

/**
 * Complete file schema for LLM provider configurations.
 * Validates version, provider array, and ensures provider ID uniqueness.
 */
export const LlmProvidersFileSchema = z
  .object({
    version: z
      .string({ message: "Version must be a string" })
      .regex(
        /^\d+\.\d+\.\d+$/,
        "Version must follow semantic versioning (e.g., 1.0.0)",
      )
      .refine(isValidSchemaVersion, "Invalid schema version format"),
    providers: z
      .array(LlmProviderConfigSchema)
      .min(1, "At least one provider must be defined"),
    metadata: LlmProvidersFileMetadataSchema,
  })
  .passthrough() // Allow unknown fields for forward compatibility
  .refine(
    (data) => {
      const ids = data.providers.map((p) => p.id);
      return ids.length === new Set(ids).size;
    },
    { message: "Provider IDs must be unique within the file" },
  );
