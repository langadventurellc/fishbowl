/**
 * ContextMenuProps interface for dropdown menu component.
 *
 * Defines the props contract for the ContextMenu component that provides
 * dropdown menu functionality with positioning and item configuration.
 *
 * @module types/ui/components/ContextMenuProps
 */

import { ContextMenuItem } from "./ContextMenuItem";
import { ContextMenuPosition } from "./ContextMenuPosition";

/**
 * Props interface for the ContextMenu component.
 *
 * This interface defines the properties required for displaying context menus
 * with proper positioning, item management, and interaction handling. The menu
 * can be positioned above or below the trigger element and supports click-outside-to-close.
 *
 * @example
 * ```typescript
 * const contextMenuProps: ContextMenuProps = {
 *   isOpen: true,
 *   position: "below",
 *   actions: [
 *     { label: "Copy", action: "copy", icon: "copy" },
 *     { label: "Regenerate", action: "regenerate", icon: "refresh" },
 *     { label: "Delete", action: "delete", icon: "trash" }
 *   ],
 *   onClose: () => {
 *     console.log("Context menu closed");
 *   },
 *   onActionClick: (action) => {
 *     console.log(`Context menu action: ${action}`);
 *   }
 * };
 *
 * // Menu with disabled items
 * const menuWithDisabledItems: ContextMenuProps = {
 *   isOpen: true,
 *   position: "above",
 *   actions: [
 *     { label: "Copy", action: "copy" },
 *     { label: "Regenerate", action: "regenerate", disabled: true },
 *     { label: "Delete", action: "delete" }
 *   ],
 *   onClose: () => closeMenu(),
 *   onActionClick: (action) => handleAction(action)
 * };
 * ```
 */
export interface ContextMenuProps {
  /**
   * Whether the context menu is currently open and visible.
   * Controls the menu's visibility and determines if it should render.
   * When false, the menu should not be displayed.
   */
  isOpen: boolean;

  /**
   * Handler for closing the context menu.
   * Called when the menu should be closed, typically triggered by
   * clicking outside the menu, pressing escape, or selecting an item.
   *
   * This handler should update the parent component's state to set
   * isOpen to false.
   */
  onClose: () => void;

  /**
   * Optional positioning preference for the menu.
   * Determines whether the menu appears above or below the trigger element.
   * The component may automatically adjust positioning to stay within viewport.
   *
   * @default "below"
   */
  position?: ContextMenuPosition;

  /**
   * Array of menu items to display.
   * Each item defines its label, action, and optional state/visual properties.
   * The order in this array determines the display order in the menu.
   */
  actions: ContextMenuItem[];

  /**
   * Handler for menu item selection.
   * Called when the user clicks on a menu item, receiving the action
   * identifier of the selected item.
   *
   * After handling the action, the menu should typically be closed.
   *
   * @param action - The action identifier from the selected menu item
   */
  onActionClick: (action: string) => void;

  /**
   * Optional CSS class name for additional styling.
   * Allows for custom styling of the context menu component
   * beyond the default theme-aware styling.
   *
   * Applied to the root element of the context menu component.
   *
   * @example "message-context-menu", "conversation-menu", "compact-menu"
   */
  className?: string;
}
