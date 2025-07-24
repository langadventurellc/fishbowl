/**
 * ThemeMode type for theme switching functionality.
 *
 * Defines the supported theme modes for the conversation UI system,
 * enabling light and dark mode switching throughout the application.
 *
 * @module types/ui/theme/ThemeMode
 */

/**
 * Supported theme modes for the conversation UI system.
 *
 * This union type defines the available theme options that control
 * the visual appearance of the entire application. Theme mode affects
 * CSS custom properties and component styling throughout the interface.
 *
 * @example
 * ```typescript
 * // Theme state management
 * const [themeMode, setThemeMode] = useState<ThemeMode>("light");
 *
 * // Theme toggle function
 * const toggleTheme = () => {
 *   setThemeMode(current => current === "light" ? "dark" : "light");
 * };
 *
 * // Conditional styling based on theme
 * const backgroundColor = themeMode === "dark"
 *   ? "var(--background)"
 *   : "var(--background)";
 *
 * // Theme class application
 * <div className={themeMode === "dark" ? "dark" : ""}>
 *   App content here
 * </div>
 * ```
 */
export type ThemeMode = "light" | "dark";
