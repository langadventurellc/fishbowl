/**
 * ButtonProps interface for unified button component.
 *
 * Defines the props contract for the Button component that supports multiple
 * variants extracted from DesignPrototype: primary, secondary, ghost, and toggle.
 * Each variant provides different visual styling for different use cases.
 *
 * @module types/ui/components/ButtonProps
 */

import { ReactNode } from "react";

/**
 * Props interface for the Button component.
 *
 * This interface defines the properties required for the unified Button component
 * that supports multiple variants with different visual appearances and behaviors.
 * All variants support consistent sizing, disabled/loading states, and accessibility features.
 *
 * @example
 * ```typescript
 * // Primary button (solid background, prominent)
 * const primaryButton: ButtonProps = {
 *   variant: "primary",
 *   size: "medium",
 *   children: "Send Message",
 *   onClick: () => handleSend()
 * };
 *
 * // Ghost button (transparent background, hover effects)
 * const ghostButton: ButtonProps = {
 *   variant: "ghost",
 *   size: "small",
 *   icon: <MenuIcon />,
 *   children: "Copy",
 *   onClick: () => handleCopy()
 * };
 *
 * // Toggle button (state-aware styling)
 * const toggleButton: ButtonProps = {
 *   variant: "toggle",
 *   size: "small",
 *   children: "✓",
 *   disabled: false,
 *   onClick: () => toggleState()
 * };
 * ```
 */
export interface ButtonProps {
  /**
   * Visual variant of the button determining its appearance and use case.
   *
   * - **primary**: Solid background with primary colors, used for main actions (Send, Save, Submit)
   * - **secondary**: Subtle background with secondary colors, for less prominent actions (Theme toggle)
   * - **ghost**: Transparent background with hover effects, for context menus and subtle actions
   * - **toggle**: State-aware styling that changes based on active/inactive state (Sidebar toggle, Context toggle)
   */
  variant: "primary" | "secondary" | "ghost" | "toggle";

  /**
   * Size variant controlling the button's dimensions and padding.
   *
   * - **small**: Compact size for inline actions, context menus (20px height)
   * - **medium**: Standard size for most actions (40px height)
   * - **large**: Prominent size for primary actions (48px height)
   *
   * @default "medium"
   */
  size?: "small" | "medium" | "large";

  /**
   * Whether the button is disabled and cannot be interacted with.
   * Disabled buttons have reduced opacity and "not-allowed" cursor.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the button is in a loading state.
   * Loading buttons show a spinner and are non-interactive.
   *
   * @default false
   */
  loading?: boolean;

  /**
   * Optional icon to display within the button.
   * Icons are positioned to the left of the text content with proper spacing.
   *
   * @example <SendIcon />, <MenuIcon />, <PlusIcon />
   */
  icon?: ReactNode;

  /**
   * The content to display inside the button.
   * Can be text, icons, or other React elements.
   */
  children: ReactNode;

  /**
   * Click handler called when the button is activated.
   * Called on mouse click, Enter key, or Space key press.
   * Not called when button is disabled or loading.
   */
  onClick?: () => void;

  /**
   * Optional CSS class name for additional styling.
   * Applied to the root button element for custom styling beyond the default variants.
   *
   * @example "custom-button", "highlighted", "compact"
   */
  className?: string;

  /**
   * Optional type attribute for the button element.
   * Determines the button's behavior when used within forms.
   *
   * @default "button"
   */
  type?: "button" | "submit" | "reset";

  /**
   * Optional ARIA label for accessibility.
   * Provides an accessible name when the button content is not descriptive enough.
   *
   * @example "Close dialog", "Toggle sidebar", "Send message"
   */
  "aria-label"?: string;
}
