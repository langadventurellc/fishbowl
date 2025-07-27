import { z } from "zod";

/**
 * Validation schema for General Settings form
 * Defines validation rules and TypeScript types for form fields
 */
export const generalSettingsSchema = z.object({
  // Auto Mode Settings
  responseDelay: z.number().min(1000).max(30000), // 1-30 seconds in milliseconds
  maximumMessages: z.number().min(0).max(500), // 0 = unlimited
  maximumWaitTime: z.number().min(5000).max(120000), // 5-120 seconds in milliseconds

  // Conversation Defaults
  defaultMode: z.enum(["manual", "auto"]),
  maximumAgents: z.number().min(1).max(8),
});

export type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;

export const defaultGeneralSettings: GeneralSettingsFormData = {
  responseDelay: 2000, // 2 seconds
  maximumMessages: 50,
  maximumWaitTime: 30000, // 30 seconds
  defaultMode: "manual",
  maximumAgents: 5,
};
