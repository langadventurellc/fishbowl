/**
 * MessageItemProps interface for message display component.
 *
 * Defines the props contract for the MessageItem component that renders
 * individual messages with expansion controls, context toggles, and menu actions.
 *
 * @module types/ui/components/MessageItemProps
 */

import { Message } from "../core/Message";

/**
 * Props interface for the MessageItem component.
 *
 * This interface defines the properties required for displaying individual messages
 * in the conversation UI, including message data, expansion state management,
 * context inclusion controls, and context menu interactions.
 *
 * @example
 * ```typescript
 * const messageProps: MessageItemProps = {
 *   message: {
 *     id: "msg-123",
 *     agent: "Technical Advisor",
 *     role: "Technical Advisor",
 *     content: "This is a sample message with some content...",
 *     timestamp: "2:15 PM",
 *     type: "agent",
 *     isActive: true,
 *     agentColor: "#3b82f6"
 *   },
 *   isExpanded: false,
 *   canRegenerate: true,
 *   contextMenuOpen: false,
 *   onToggleContext: (messageId) => {
 *     console.log(`Toggle context for message: ${messageId}`);
 *   },
 *   onToggleExpansion: (messageId) => {
 *     console.log(`Toggle expansion for message: ${messageId}`);
 *   },
 *   onContextMenuAction: (action, messageId) => {
 *     console.log(`Context menu action: ${action} for message: ${messageId}`);
 *   },
 *   onOpenContextMenu: (messageId) => {
 *     console.log(`Open context menu for message: ${messageId}`);
 *   }
 * };
 * ```
 */
export interface MessageItemProps {
  /**
   * The message data to display.
   * Contains all necessary information for rendering the message including
   * content, metadata, sender information, and visual state.
   *
   * The message type determines the visual styling and layout, while
   * isActive controls the context inclusion state.
   */
  message: Message;

  /**
   * Whether the message content is currently expanded.
   * Controls the display of long messages with "Show more/less" functionality.
   * When true, the full message content is visible. When false, content
   * may be truncated with an expansion control.
   */
  isExpanded: boolean;

  /**
   * Whether the message can be regenerated.
   * Controls the visibility of the regenerate option in the context menu.
   * Typically true for agent messages that can be re-generated with
   * different content.
   */
  canRegenerate: boolean;

  /**
   * Whether the context menu is currently open for this message.
   * Controls the visual state of the context menu button and menu visibility.
   * Used for managing which message's context menu is active.
   */
  contextMenuOpen: boolean;

  /**
   * Handler for toggling message context inclusion.
   * Called when the user clicks the context toggle button (checkmark icon).
   * This controls whether the message is included in the conversation context
   * sent to agents for processing.
   *
   * @param messageId - The ID of the message to toggle context for
   */
  onToggleContext: (messageId: string) => void;

  /**
   * Handler for context menu actions.
   * Called when the user selects an action from the message context menu.
   * Common actions include "copy", "regenerate", and "delete".
   *
   * @param action - The selected action (e.g., "copy", "regenerate", "delete")
   * @param messageId - The ID of the message the action applies to
   */
  onContextMenuAction: (action: string, messageId: string) => void;

  /**
   * Handler for opening/closing the context menu.
   * Called when the user clicks the context menu button (ellipsis icon).
   * Receives the message ID when opening a menu, or null when closing.
   *
   * @param messageId - The ID of the message to open menu for, or null to close
   */
  onOpenContextMenu: (messageId: string | null) => void;

  /**
   * Optional CSS class name for additional styling.
   * Allows for custom styling of the message item component
   * beyond the default theme-aware styling.
   *
   * Applied to the root element of the message item component.
   *
   * @example "custom-message", "highlighted", "compact"
   */
  className?: string;
}
