import { ComponentSize } from "../components/ComponentSize";
import { MenuTriggerPosition } from "./MenuTriggerPosition";
import { MenuTriggerVariant } from "./MenuTriggerVariant";

/**
 * Props interface for the MenuTriggerDisplay component.
 *
 * This component provides visual representation of ellipsis button triggers
 * extracted from DesignPrototype.tsx, focusing purely on display without
 * interactive functionality beyond visual state representation.
 *
 * @module types/ui/menu/MenuTriggerDisplayProps
 */
export interface MenuTriggerDisplayProps {
  /**
   * Visual variant to display the menu trigger in.
   * Controls which visual state is shown for demonstration purposes.
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
