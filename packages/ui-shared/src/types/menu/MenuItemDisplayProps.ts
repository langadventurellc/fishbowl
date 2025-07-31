import { ContextMenuItem } from "./ContextMenuItem";
import { MenuItemVariant } from "./MenuItemVariant";

/**
 * Props interface for the MenuItemDisplay component.
 *
 * Extends the base ContextMenuItem interface with display-specific properties
 * for pure visual representation without interactive functionality.
 *
 * @module types/ui/menu/MenuItemDisplayProps
 */
export interface MenuItemDisplayProps extends ContextMenuItem {
  /**
   * Visual variant to display the menu item in.
   * Controls which visual state is shown for demonstration purposes.
   */
  variant?: MenuItemVariant;

  /**
   * Whether to show a separator line below this menu item.
   * Used for visual grouping of menu items in display.
   */
  separator?: boolean;

  /**
   * Optional CSS class name for additional styling.
   * Applied to the root div element of the component.
   */
  className?: string;
}
