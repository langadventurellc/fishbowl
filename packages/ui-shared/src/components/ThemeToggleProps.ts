/**
 * ThemeToggleProps interface for theme switching component.
 *
 * Defines the props contract for the ThemeToggle component that handles
 * light/dark mode switching with visual state management.
 *
 * @module types/ui/components/ThemeToggleProps
 */

import { ThemeMode } from "../theme/ThemeMode";

/**
 * Props interface for the ThemeToggle component.
 *
 * This interface defines the properties required for theme switching functionality,
 * including current theme state and toggle interaction handling. The component
 * typically displays as a sun/moon icon toggle button.
 *
 * @example
 * ```typescript
 * const themeToggleProps: ThemeToggleProps = {
 *   currentTheme: "light",
 *   onToggle: (newTheme) => {
 *     console.log(`Switching to ${newTheme} theme`);
 *     // Update theme in application state
 *     setTheme(newTheme);
 *   },
 *   className: "theme-toggle-button"
 * };
 *
 * // Dark theme state example
 * const darkThemeProps: ThemeToggleProps = {
 *   currentTheme: "dark",
 *   onToggle: (newTheme) => {
 *     document.documentElement.className = newTheme === "dark" ? "dark" : "";
 *   }
 * };
 * ```
 */
export interface ThemeToggleProps {
  /**
   * The current theme mode.
   * Determines which icon to display and the toggle button's visual state.
   * When "light", typically shows a moon icon to indicate switching to dark.
   * When "dark", typically shows a sun icon to indicate switching to light.
   */
  currentTheme: ThemeMode;

  /**
   * Handler for theme toggle interactions.
   * Called when the user clicks the theme toggle button.
   * Receives the new theme mode that should be applied.
   *
   * The new theme will be the opposite of the current theme:
   * - If current is "light", newTheme will be "dark"
   * - If current is "dark", newTheme will be "light"
   *
   * @param newTheme - The theme mode to switch to
   */
  onToggle: (newTheme: ThemeMode) => void;

  /**
   * Optional CSS class name for additional styling.
   * Allows for custom styling of the theme toggle component
   * beyond the default theme-aware styling.
   *
   * Applied to the root element of the theme toggle component.
   *
   * @example "theme-toggle", "header-toggle", "compact-toggle"
   */
  className?: string;
}
