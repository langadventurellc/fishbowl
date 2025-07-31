/**
 * Menu item variant types for visual state representation.
 *
 * Defines the supported visual states for menu items in the display system,
 * following the pattern from MessageType.ts with named type unions.
 *
 * @module types/ui/components/MenuItemVariant
 */

/**
 * Visual variant states for menu item display components.
 * - "normal": Default menu item appearance
 * - "hover": Visual hover state appearance (without actual hover behavior)
 * - "disabled": Grayed out appearance with reduced opacity
 * - "danger": Red/warning styling for destructive actions
 */
export type MenuItemVariant = "normal" | "hover" | "disabled" | "danger";
