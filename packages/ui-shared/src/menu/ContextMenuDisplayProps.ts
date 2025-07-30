import { ContextMenuItem } from "./ContextMenuItem";

/**
 * Props interface for the ContextMenuDisplay component.
 *
 * Defines the configuration options for context menus used throughout the
 * application. Supports flexible positioning, menu item management, and
 * consistent styling across different menu contexts.
 *
 * @module types/ui/menu/ContextMenuDisplayProps
 */
export interface ContextMenuDisplayProps {
  /**
   * Whether the context menu is currently open and visible.
   * Controls the menu's visibility and determines if it should render.
   */
  isOpen: boolean;

  /**
   * Positioning preference for the menu relative to trigger element.
   * Determines whether the menu appears above or below.
   */
  position: "above" | "below";

  /**
   * Array of menu items to display.
   * Each item defines its label, action, and optional state/visual properties.
   */
  items: ContextMenuItem[];

  /**
   * Optional CSS class name for additional styling.
   * Applied to the root element of the context menu component.
   */
  className?: string;
}
