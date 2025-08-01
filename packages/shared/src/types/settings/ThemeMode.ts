/**
 * ThemeMode type for theme switching functionality.
 *
 * Defines the supported theme modes for the conversation UI system,
 * enabling light and dark mode switching throughout the application.
 *
 * @module types/ThemeMode
 */

export type ThemeMode = "light" | "dark" | "system";

/**
 * Const array of all valid ThemeMode values for runtime validation
 */
export const THEME_MODES: readonly ThemeMode[] = [
  "light",
  "dark",
  "system",
] as const;
