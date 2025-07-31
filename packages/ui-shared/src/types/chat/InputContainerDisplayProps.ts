/**
 * InputContainerDisplayProps interface for input container display component.
 *
 * Defines the props contract for the InputContainerDisplay component that shows
 * the visual representation of the input area layout container without any
 * interactive functionality. Used for display-only purposes in component showcase.
 *
 * @module types/ui/components/InputContainerDisplayProps
 */

import { ConversationMode } from "@fishbowl-ai/shared";
import { ComponentSize, LayoutVariant } from "../components";

/**
 * Props interface for the InputContainerDisplay component.
 *
 * This interface defines the properties required for displaying an input container
 * that composes MessageInputDisplay, SendButtonDisplay, and ConversationModeToggleDisplay
 * internally. The component is purely display-focused and does not include any
 * event handlers or interactive functionality.
 *
 * @example
 * ```typescript
 * // Basic default container
 * const defaultContainer: InputContainerDisplayProps = {
 *   layoutVariant: "default",
 *   messageInputProps: {
 *     placeholder: "Type your message here...",
 *     size: "medium"
 *   },
 *   sendButtonProps: {
 *     disabled: false,
 *     loading: false
 *   },
 *   modeToggleProps: {
 *     currentMode: "manual",
 *     disabled: false
 *   }
 * };
 *
 * // Compact layout container
 * const compactContainer: InputContainerDisplayProps = {
 *   layoutVariant: "compact",
 *   messageInputProps: {
 *     placeholder: "Compact input...",
 *     size: "small"
 *   }
 * };
 * ```
 */
export interface InputContainerDisplayProps {
  /**
   * Layout variant controlling the container's spacing and visual presentation.
   *
   * - **default**: Standard spacing and layout for normal use (16px padding, 12px gap)
   * - **compact**: Reduced spacing for smaller screens (12px padding, 8px gap)
   *
   * @default "default"
   */
  layoutVariant?: LayoutVariant;

  /**
   * Optional CSS class name for additional styling.
   * Applied to the root container element for custom styling
   * beyond the default theme-aware styling.
   *
   * @example "custom-container", "highlighted", "bordered-container"
   */
  className?: string;

  /**
   * Props for the MessageInputDisplay component.
   * Controls the input area placeholder, content, size, and disabled state.
   */
  messageInputProps?: {
    placeholder?: string;
    content?: string;
    disabled?: boolean;
    size?: ComponentSize;
    className?: string;
  };

  /**
   * Props for the SendButtonDisplay component.
   * Controls the send button disabled, loading states and aria-label.
   */
  sendButtonProps?: {
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    "aria-label"?: string;
  };

  /**
   * Props for the ConversationModeToggleDisplay component.
   * Controls the current mode and disabled state of the mode toggle.
   */
  modeToggleProps?: {
    currentMode?: ConversationMode;
    disabled?: boolean;
    className?: string;
  };
}
