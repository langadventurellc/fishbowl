import { z } from "zod";
import { advancedSettingsSchema } from "./advancedSettingsSchema";
import { appearanceSettingsSchema } from "./appearanceSettingsSchema";
import { generalSettingsSchema } from "./generalSettingsSchema";

/**
 * Current schema version constant for consistency across the application.
 * Used for schema evolution and migration support.
 */
export const CURRENT_SCHEMA_VERSION = "1.0.0";

/**
 * Master Zod schema for validating complete persisted settings data.
 *
 * Features:
 * - Combines all settings category schemas
 * - Schema versioning with current version default
 * - Automatic timestamp generation for lastUpdated
 * - Schema evolution support with .passthrough()
 * - Complete validation for entire settings structure
 * - Clear error messages for validation failures
 * - No sensitive data exposure in validation errors
 */
export const persistedSettingsSchema = z
  .object({
    // Schema versioning for migration support
    schemaVersion: z
      .string({ message: "Schema version must be a string" })
      .min(1, "Schema version cannot be empty")
      .default(CURRENT_SCHEMA_VERSION),

    // Settings categories with full validation
    general: generalSettingsSchema,
    appearance: appearanceSettingsSchema,
    advanced: advancedSettingsSchema,

    // Metadata with automatic generation
    lastUpdated: z
      .string({ message: "Last updated must be an ISO timestamp string" })
      .datetime("Last updated must be a valid ISO datetime")
      .default(() => new Date().toISOString()),
  })
  .passthrough(); // Allow unknown fields for schema evolution
