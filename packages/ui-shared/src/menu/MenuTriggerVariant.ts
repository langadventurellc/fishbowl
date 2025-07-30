/**
 * Menu trigger variant types for visual state representation.
 *
 * Defines the supported visual states for menu trigger buttons in the display system,
 * following the pattern from MessageType.ts and MenuItemVariant.ts with named type unions.
 *
 * @module types/ui/components/MenuTriggerVariant
 */

/**
 * Visual variant states for menu trigger display components.
 * - "normal": Default ellipsis button appearance (0.6 opacity)
 * - "hover": Visual hover state with background color and full opacity
 * - "active": Button state when menu is open
 * - "disabled": Reduced opacity and disabled cursor appearance
 */
export type MenuTriggerVariant = "normal" | "hover" | "active" | "disabled";
