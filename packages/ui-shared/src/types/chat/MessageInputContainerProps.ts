/**
 * MessageInputContainerProps interface for message input container component.
 *
 * Defines the props contract for the MessageInputContainer component that integrates
 * MessageInputDisplay and SendButtonDisplay with state management for complete
 * message sending functionality.
 *
 * @module types/ui/components/MessageInputContainerProps
 */

import { MessageInputDisplayProps } from "./MessageInputDisplayProps";
import { SendButtonDisplayProps } from "./SendButtonDisplayProps";

/**
 * Props interface for the MessageInputContainer component.
 *
 * This interface defines the properties required for the integrated message input
 * container that handles form state, validation, loading states, and message submission.
 * The component connects to useCreateMessage hook and useChatStore for complete functionality.
 *
 * @example
 * ```typescript
 * // Basic message input container
 * const basicContainer: MessageInputContainerProps = {
 *   conversationId: "conv-123"
 * };
 *
 * // Compact layout container
 * const compactContainer: MessageInputContainerProps = {
 *   conversationId: "conv-456",
 *   layoutVariant: "compact",
 *   className: "custom-input-container"
 * };
 *
 * // Container with custom props
 * const customContainer: MessageInputContainerProps = {
 *   conversationId: "conv-789",
 *   messageInputProps: {
 *     placeholder: "Ask your question...",
 *     size: "large"
 *   },
 *   sendButtonProps: {
 *     "aria-label": "Send question to agents"
 *   }
 * };
 * ```
 */
export interface MessageInputContainerProps {
  /**
   * Conversation ID for message creation.
   * Required for associating created messages with the correct conversation.
   *
   * @example "conv-123", "conversation-uuid-456"
   */
  conversationId: string;

  /**
   * Layout variant controlling spacing and sizing.
   *
   * - **default**: Standard spacing (16px padding, 12px gap) for normal use
   * - **compact**: Reduced spacing (12px padding, 8px gap) for smaller screens
   *
   * @default "default"
   */
  layoutVariant?: "default" | "compact";

  /**
   * Optional CSS class name for additional styling.
   * Applied to the root container element for custom styling
   * beyond the default theme-aware styling.
   *
   * @example "custom-input-container", "highlighted", "sidebar-input"
   */
  className?: string;

  /**
   * Override props for the MessageInputDisplay component.
   * Allows customization of the text input behavior and appearance.
   *
   * @example { placeholder: "Ask a question...", size: "large" }
   */
  messageInputProps?: Partial<MessageInputDisplayProps>;

  /**
   * Override props for the SendButtonDisplay component.
   * Allows customization of the send button behavior and appearance.
   *
   * @example { "aria-label": "Send question to agents" }
   */
  sendButtonProps?: Partial<SendButtonDisplayProps>;
}
