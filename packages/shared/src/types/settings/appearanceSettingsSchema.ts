import { z } from "zod";
import { MessageSpacing } from "./MessageSpacing";
import { ShowTimestamps } from "./ShowTimestamps";
import { ThemeMode } from "./ThemeMode";

/**
 * Zod schema for validating persisted appearance settings data.
 *
 * Features:
 * - Comprehensive validation with security limits
 * - Default values for all fields using .default()
 * - Clear error messages for validation failures
 * - Font size security validation to prevent layout breaking
 * - Enum validation with descriptive error messages
 */
export const appearanceSettingsSchema = z.object({
  // Theme Selection with system default
  theme: z
    .enum(["light", "dark", "system"] as const satisfies readonly ThemeMode[], {
      message: "Theme must be 'light', 'dark', or 'system'",
    })
    .default("system"),

  // Display Settings
  showTimestamps: z
    .enum(
      ["always", "hover", "never"] as const satisfies readonly ShowTimestamps[],
      {
        message: "Show timestamps must be 'always', 'hover', or 'never'",
      },
    )
    .default("hover"),

  showActivityTime: z
    .boolean({ message: "Show activity time must be true or false" })
    .default(true),

  compactList: z
    .boolean({ message: "Compact list must be true or false" })
    .default(false),

  // Chat Display Settings with security validation
  fontSize: z
    .number({ message: "Font size must be a number" })
    .min(12, "Font size must be at least 12px")
    .max(18, "Font size cannot exceed 18px")
    .int("Font size must be a whole number")
    .default(14),

  messageSpacing: z
    .enum(
      [
        "compact",
        "normal",
        "relaxed",
      ] as const satisfies readonly MessageSpacing[],
      {
        message: "Message spacing must be 'compact', 'normal', or 'relaxed'",
      },
    )
    .default("normal"),
});
