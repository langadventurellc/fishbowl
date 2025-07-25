import { ContextMenuItem } from "./ContextMenuItem";

/**
 * Props interface for the ContextMenuDisplay component.
 *
 * This component provides visual representation of dropdown context menus
 * extracted from DesignPrototype.tsx, focusing purely on display without
 * interactive functionality beyond visual state representation.
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
