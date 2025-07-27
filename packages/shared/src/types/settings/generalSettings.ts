import { z } from "zod";

/**
 * Validation schema for General Settings form
 * Defines validation rules and TypeScript types for form fields
 */
export const generalSettingsSchema = z
  .object({
    // Auto Mode Settings with detailed error messages
    responseDelay: z
      .number({ message: "Response delay must be a number" })
      .min(1000, "Response delay must be at least 1 second")
      .max(30000, "Response delay cannot exceed 30 seconds")
      .int("Response delay must be a whole number"),

    maximumMessages: z
      .number({ message: "Maximum messages must be a number" })
      .min(0, "Maximum messages cannot be negative")
      .max(500, "Maximum messages cannot exceed 500")
      .int("Maximum messages must be a whole number"),

    maximumWaitTime: z
      .number({ message: "Maximum wait time must be a number" })
      .min(5000, "Maximum wait time must be at least 5 seconds")
      .max(120000, "Maximum wait time cannot exceed 2 minutes")
      .int("Maximum wait time must be a whole number"),

    // Conversation Defaults
    defaultMode: z.enum(["manual", "auto"], {
      message: "Default mode must be either 'manual' or 'auto'",
    }),

    maximumAgents: z
      .number({ message: "Maximum agents must be a number" })
      .min(1, "At least 1 agent is required")
      .max(8, "Cannot exceed 8 agents")
      .int("Maximum agents must be a whole number"),

    // Other Settings
    checkUpdates: z.boolean({ message: "Update check must be true or false" }),
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

    // Validate unlimited messages setting with auto mode
    if (data.maximumMessages === 0 && data.defaultMode === "auto") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Consider setting a message limit when using auto mode to prevent runaway conversations",
        path: ["maximumMessages"],
      });
    }
  });

export type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;

export const defaultGeneralSettings: GeneralSettingsFormData = {
  responseDelay: 2000, // 2 seconds
  maximumMessages: 50,
  maximumWaitTime: 30000, // 30 seconds
  defaultMode: "manual",
  maximumAgents: 4,
  checkUpdates: true,
};
