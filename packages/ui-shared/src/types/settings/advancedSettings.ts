import { z } from "zod";

/**
 * Validation schema for Advanced Settings form
 * Defines validation rules and TypeScript types for developer and experimental options
 *
 * @security All developer options default to false to prevent accidental enablement
 * and potential security risks from debug logging or experimental features
 */
export const advancedSettingsSchema = z
  .object({
    /**
     * Whether to enable debug logging throughout the application
     *
     * @warning When enabled, may log sensitive information to console/files
     * @default false - Disabled by default for security
     */
    debugLogging: z.boolean({
      message: "Debug logging must be true or false",
    }),

    /**
     * Whether to enable experimental features that may be unstable
     *
     * @warning Experimental features may cause application instability
     * @default false - Disabled by default for stability
     */
    experimentalFeatures: z.boolean({
      message: "Experimental features must be true or false",
    }),
  })
  .strict();

/**
 * Type for advanced settings form data
 * Inferred from the Zod schema to ensure type safety
 */
export type AdvancedSettingsFormData = z.infer<typeof advancedSettingsSchema>;

/**
 * Default values for advanced settings
 * All developer options are disabled by default for security and stability
 */
export const defaultAdvancedSettings: AdvancedSettingsFormData = {
  debugLogging: false,
  experimentalFeatures: false,
};
