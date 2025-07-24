/**
 * ContextMenuItem interface for context menu item definition.
 *
 * Defines the structure for individual menu items in context menus,
 * including their display text, action identifier, state, and optional
 * visual elements like icons.
 *
 * @module types/ui/components/ContextMenuItem
 */

/**
 * Represents a single item in the context menu.
 *
 * This interface defines the structure for individual menu items,
 * including their display text, action identifier, state, and optional
 * visual elements like icons.
 *
 * @example
 * ```typescript
 * const menuItems: ContextMenuItem[] = [
 *   {
 *     label: "Copy",
 *     action: "copy",
 *     icon: "copy"
 *   },
 *   {
 *     label: "Regenerate",
 *     action: "regenerate",
 *     disabled: false,
 *     icon: "refresh"
 *   },
 *   {
 *     label: "Delete",
 *     action: "delete",
 *     icon: "trash"
 *   }
 * ];
 * ```
 */
export interface ContextMenuItem {
  /**
   * Display text for the menu item.
   * This is the human-readable text shown to the user in the menu.
   *
   * @example "Copy", "Regenerate", "Delete", "Rename"
   */
  label: string;

  /**
   * Action identifier for the menu item.
   * This is the value passed to the onActionClick handler when the item
   * is selected. Should be a unique identifier for the action.
   *
   * @example "copy", "regenerate", "delete", "rename"
   */
  action: string;

  /**
   * Whether the menu item is disabled.
   * When true, the item appears grayed out and cannot be clicked.
   * When false or undefined, the item is interactive.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Optional icon identifier for the menu item.
   * Used to display an icon next to the label for visual clarity.
   * The specific icon rendering depends on the component implementation.
   *
   * @example "copy", "refresh", "trash", "edit"
   */
  icon?: string;
}
