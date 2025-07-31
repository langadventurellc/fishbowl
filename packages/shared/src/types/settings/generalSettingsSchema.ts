import { z } from "zod";

/**
 * Zod schema for validating persisted general settings data.
 *
 * Features:
 * - Comprehensive validation with security limits
 * - Default values for all fields using .default()
 * - Cross-field validation via .superRefine()
 * - Clear error messages for validation failures
 * - No sensitive data exposure in validation errors
 */
export const generalSettingsSchema = z
  .object({
    // Auto Mode Settings with security-conscious limits
    responseDelay: z
      .number({ message: "Response delay must be a number" })
      .min(1000, "Response delay must be at least 1000ms")
      .max(30000, "Response delay cannot exceed 30000ms")
      .int("Response delay must be a whole number")
      .default(2000),

    maximumMessages: z
      .number({ message: "Maximum messages must be a number" })
      .min(0, "Maximum messages cannot be negative")
      .max(500, "Maximum messages cannot exceed 500")
      .int("Maximum messages must be a whole number")
      .default(50),

    maximumWaitTime: z
      .number({ message: "Maximum wait time must be a number" })
      .min(5000, "Maximum wait time must be at least 5000ms")
      .max(120000, "Maximum wait time cannot exceed 120000ms")
      .int("Maximum wait time must be a whole number")
      .default(30000),

    // Conversation Defaults with strict enum validation
    defaultMode: z
      .enum(["manual", "auto"], {
        message: "Default mode must be either 'manual' or 'auto'",
      })
      .default("manual"),

    maximumAgents: z
      .number({ message: "Maximum agents must be a number" })
      .min(1, "At least 1 agent is required")
      .max(8, "Cannot exceed 8 agents")
      .int("Maximum agents must be a whole number")
      .default(4),

    // Other Settings
    checkUpdates: z
      .boolean({ message: "Update check must be true or false" })
      .default(true),
  })
  .superRefine((data, ctx) => {
    // Cross-field validation: ensure response delay is reasonable relative to wait time
    if (data.responseDelay >= data.maximumWaitTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Response delay should be less than maximum wait time",
        path: ["responseDelay"],
      });
    }

    // Validate unlimited messages setting with auto mode (warning, not error)
    if (data.maximumMessages === 0 && data.defaultMode === "auto") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Consider setting a message limit when using auto mode to prevent runaway conversations",
        path: ["maximumMessages"],
      });
    }
  });
