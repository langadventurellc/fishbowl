import { ComponentSize } from "../components";
import { MenuTriggerPosition } from "./MenuTriggerPosition";
import { MenuTriggerVariant } from "./MenuTriggerVariant";

/**
 * Props interface for the MenuTriggerDisplay component.
 *
 * Defines the configuration options for menu trigger buttons used throughout
 * the application to activate dropdown menus and context menus. Supports
 * multiple visual states, positioning options, and sizing configurations.
 *
 * @module types/ui/menu/MenuTriggerDisplayProps
 */
export interface MenuTriggerDisplayProps {
  /**
   * Visual variant to display the menu trigger in.
   * Controls the interactive state and styling of the trigger button.
   */
  variant?: MenuTriggerVariant;

  /**
   * Positioning style for the trigger element.
   * Determines the CSS position property value.
   */
  position?: MenuTriggerPosition;

  /**
   * Size variant for the trigger button.
   * Controls the overall dimensions and padding.
   * Note: Only 'small' and 'medium' variants are used for menu triggers.
   */
  size?: Extract<ComponentSize, "small" | "medium">;

  /**
   * Optional CSS class name for additional styling.
   * Applied to the root div element of the component.
   */
  className?: string;
}
