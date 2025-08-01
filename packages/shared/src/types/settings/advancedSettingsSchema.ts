import { z } from "zod";

/**
 * Zod schema for validating persisted advanced settings data.
 *
 * Features:
 * - Boolean validation with security defaults
 * - Default values for all fields using .default()
 * - Clear error messages for validation failures
 * - Security consideration: both options default false for stability
 * - Schema evolution support for future advanced options
 */
export const advancedSettingsSchema = z
  .object({
    // Developer Options with security default
    debugMode: z
      .boolean({ message: "Debug mode must be true or false" })
      .default(false),

    // Experimental Features with security default
    experimentalFeatures: z
      .boolean({
        message: "Experimental features must be true or false",
      })
      .default(false),
  })
  .passthrough(); // Allow unknown fields for schema evolution
