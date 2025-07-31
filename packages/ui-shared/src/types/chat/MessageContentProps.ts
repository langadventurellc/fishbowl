/**
 * MessageContentProps interface for the MessageContent component.
 *
 * Defines props for the message text content display component that renders
 * message text with proper formatting, line spacing, and overflow handling.
 *
 * @module types/ui/components/MessageContentProps
 */

import { MessageType } from "src/types/MessageType";

/**
 * Props interface for the MessageContent component.
 *
 * MessageContent displays message text content with proper typography,
 * whitespace preservation, and text selection support. Serves as a pure
 * display component for rendering formatted message text with expansion capabilities.
 *
 * @example
 * ```typescript
 * // Basic agent message content
 * <MessageContent
 *   content="This is a helpful response to your question."
 *   messageType="agent"
 * />
 *
 * // User message content
 * <MessageContent
 *   content="Can you help me with this task?"
 *   messageType="user"
 * />
 *
 * // Long content with line breaks
 * <MessageContent
 *   content="This is a longer message with\nmultiple lines\n\nAnd paragraph breaks."
 *   messageType="agent"
 * />
 *
 * // System message content
 * <MessageContent
 *   content="User joined the conversation"
 *   messageType="system"
 * />
 * ```
 */
export interface MessageContentProps {
  /**
   * The text content of the message to display.
   * Supports multi-line text with whitespace and line breaks preserved.
   * Text selection and copying is enabled by default.
   *
   * @example "Hello, how can I help you today?"
   * @example "This is a longer message\nwith line breaks\n\nAnd paragraphs."
   */
  content: string;

  /**
   * The type of message for conditional styling.
   * Affects visual presentation and typography:
   * - "user": User messages (may have different styling)
   * - "agent": Agent messages (standard text styling)
   * - "system": System messages (muted, italic styling)
   */
  messageType: MessageType;

  /**
   * Optional CSS class name for custom styling.
   * Allows additional styling to be applied to the content container
   * while preserving the base component typography and formatting.
   */
  className?: string;

  /**
   * Optional character threshold for triggering content expansion.
   * Messages longer than this threshold will show "Show more..." functionality.
   * Defaults to 500 characters if not specified.
   *
   * @default 500
   * @example 300 // Show expansion for messages longer than 300 characters
   * @example 1000 // Only show expansion for very long messages (1000+ chars)
   */
  expansionThreshold?: number;
}
