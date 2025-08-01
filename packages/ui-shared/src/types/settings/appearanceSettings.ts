import { z } from "zod";
import {
  THEME_MODES,
  SHOW_TIMESTAMPS_OPTIONS,
  MESSAGE_SPACING_OPTIONS,
} from "@fishbowl-ai/shared";

/**
 * Validation schema for Appearance Settings form
 * Defines validation rules and TypeScript types for appearance configuration
 */
export const appearanceSettingsSchema = z.object({
  // Theme selection
  theme: z.enum(THEME_MODES, {
    message: "Theme must be light, dark, or system",
  }),

  // Timestamp display preferences
  showTimestamps: z.enum(SHOW_TIMESTAMPS_OPTIONS, {
    message: "Show timestamps must be always, hover, or never",
  }),

  // Activity time display toggle
  showActivityTime: z.boolean({
    message: "Show activity time must be true or false",
  }),

  // Compact list display toggle
  compactList: z.boolean({
    message: "Compact list must be true or false",
  }),

  // Font size with range validation
  fontSize: z
    .number({ message: "Font size must be a number" })
    .min(12, "Font size must be at least 12px")
    .max(20, "Font size cannot exceed 20px")
    .int("Font size must be a whole number"),

  // Message spacing preferences
  messageSpacing: z.enum(MESSAGE_SPACING_OPTIONS, {
    message: "Message spacing must be compact, normal, or relaxed",
  }),
});

export type AppearanceSettingsFormData = z.infer<
  typeof appearanceSettingsSchema
>;

export const defaultAppearanceSettings: AppearanceSettingsFormData = {
  theme: "system",
  showTimestamps: "always",
  showActivityTime: true,
  compactList: false,
  fontSize: 14,
  messageSpacing: "normal",
};
