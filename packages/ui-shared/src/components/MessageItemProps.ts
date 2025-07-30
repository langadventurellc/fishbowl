/**
 * MessageItemProps interface for message display component.
 *
 * Defines the props contract for the MessageItem component that renders
 * individual messages with expansion controls, context toggles, and menu actions.
 *
 * @module types/ui/components/MessageItemProps
 */

import { MessageViewModel } from "../core/MessageViewModel";

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
 *   canRegenerate: true,
 *   onContextMenuAction: (action, messageId) => {
 *     console.log(`Context menu action: ${action} for message: ${messageId}`);
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
  message: MessageViewModel;

  /**
   * Whether the message can be regenerated.
   * Controls the visibility of the regenerate option in the context menu.
   * Typically true for agent messages that can be re-generated with
   * different content.
   */
  canRegenerate: boolean;

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
