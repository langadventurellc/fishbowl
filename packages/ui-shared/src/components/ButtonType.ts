/**
 * ButtonType union for unified button component system.
 *
 * Defines the supported button variants that determine visual styling and behavior
 * of buttons in the application interface.
 *
 * @module types/ui/components/ButtonType
 */

/**
 * The type of button variant, determining visual styling and behavior.
 * - "primary": Solid background with primary colors, used for main actions (Send, Save, Submit)
 * - "secondary": Subtle background with secondary colors, for less prominent actions (Theme toggle)
 * - "ghost": Transparent background with hover effects, for context menus and subtle actions
 * - "toggle": State-aware styling that changes based on active/inactive state (Sidebar toggle, Context toggle)
 */
export type ButtonType = "primary" | "secondary" | "ghost" | "toggle";
