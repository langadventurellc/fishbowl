/**
 * MessageInputDisplayProps interface for message input display component.
 *
 * Defines the props contract for the MessageInputDisplay component that shows
 * the visual representation of the message input textarea without any
 * interactive functionality. Used for display-only purposes in component showcase.
 *
 * @module types/ui/components/MessageInputDisplayProps
 */

import { ComponentSize } from "../components";

/**
 * Props interface for the MessageInputDisplay component.
 *
 * This interface defines the properties required for displaying a message input
 * textarea in its various visual states. The component is purely display-focused
 * and does not include any event handlers or interactive functionality.
 *
 * @example
 * ```typescript
 * // Basic message input display
 * const basicInput: MessageInputDisplayProps = {
 *   placeholder: "Type your message here...",
 *   content: "",
 *   size: "medium"
 * };
 *
 * // Input with content and custom styling
 * const contentInput: MessageInputDisplayProps = {
 *   placeholder: "Enter message",
 *   content: "Hello, how can I help you today?",
 *   size: "large",
 *   className: "custom-input-style"
 * };
 *
 * // Disabled state input
 * const disabledInput: MessageInputDisplayProps = {
 *   placeholder: "Message input disabled",
 *   disabled: true,
 *   size: "medium"
 * };
 * ```
 */
export interface MessageInputDisplayProps {
  /**
   * Placeholder text displayed when the input is empty.
   * Provides guidance to users about what content is expected.
   *
   * @example "Type your message here...", "Enter your question"
   */
  placeholder?: string;

  /**
   * Current content displayed in the input textarea.
   * Shows the text that would be present in an active input field.
   *
   * @example "Hello world", "This is a sample message"
   */
  content?: string;

  /**
   * Whether the input appears in a disabled state.
   * Disabled inputs show reduced opacity and visual indicators
   * that the input is not available for interaction.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Size variant controlling the input's dimensions and padding.
   *
   * - **small**: Compact size for inline contexts (32px height)
   * - **medium**: Standard size for most use cases (40px height)
   * - **large**: Prominent size for primary input areas (48px height)
   *
   * @default "medium"
   */
  size?: ComponentSize;

  /**
   * Optional CSS class name for additional styling.
   * Applied to the root textarea element for custom styling
   * beyond the default theme-aware styling.
   *
   * @example "custom-input", "highlighted", "compact-input"
   */
  className?: string;
}
