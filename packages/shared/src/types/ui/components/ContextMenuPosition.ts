/**
 * ContextMenuPosition union for dropdown menu positioning.
 *
 * Defines the supported positioning options for context menus
 * relative to their trigger elements.
 *
 * @module types/ui/components/ContextMenuPosition
 */

/**
 * Positioning preference for context menus.
 * Determines whether the menu appears above or below the trigger element.
 * The component may automatically adjust positioning to stay within viewport.
 */
export type ContextMenuPosition = "above" | "below";
