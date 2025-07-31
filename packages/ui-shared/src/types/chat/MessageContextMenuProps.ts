/**
 * MessageContextMenuProps interface for message-specific context menu component.
 *
 * Defines the props contract for the MessageContextMenu component that provides
 * context menu functionality specifically for messages. This component acts as
 * a bridge between the generic ContextMenu component and message-specific actions.
 *
 * @module types/ui/components/MessageContextMenuProps
 */

import { MessageViewModel } from "src/types/MessageViewModel";

/**
 * Props interface for the MessageContextMenu component.
 *
 * This interface defines the properties for a message-specific context menu that
 * uses the generic ContextMenu component internally while providing message-specific
 * menu items and actions. The component handles message context menu logic while
 * accepting message data and action handlers.
 *
 * @example
 * ```typescript
 * // Basic usage with message data and handlers
 * <MessageContextMenu
 *   message={message}
 *   onCopy={() => handleCopy(message.id)}
 *   onDelete={() => handleDelete(message.id)}
 * />
 *
 * // With regeneration option and positioning
 * <MessageContextMenu
 *   message={message}
 *   position="above"
 *   onCopy={() => copyToClipboard(message.content)}
 *   onDelete={() => deleteMessage(message.id)}
 *   onRegenerate={() => regenerateMessage(message.id)}
 *   canRegenerate={message.type === "agent"}
 * />
 *
 * // Below positioning with all actions
 * <MessageContextMenu
 *   message={message}
 *   position="below"
 *   onCopy={handleCopy}
 *   onDelete={handleDelete}
 *   onRegenerate={handleRegenerate}
 *   canRegenerate={true}
 * />
 * ```
 */
export interface MessageContextMenuProps {
  /**
   * The message data for which the context menu is displayed.
   * Used to determine available actions and provide context for menu items.
   * Message type and other properties may affect which menu options are shown.
   */
  message: MessageViewModel;

  /**
   * Positioning preference for the menu relative to trigger element.
   * - "above": Menu appears above the trigger
   * - "below": Menu appears below the trigger
   *
   * @default "below"
   */
  position?: "above" | "below";

  /**
   * Handler for the copy message action.
   * Called when the user selects "Copy message" from the context menu.
   * Should handle copying the message content to clipboard or other copy logic.
   */
  onCopy: () => void;

  /**
   * Handler for the delete message action.
   * Called when the user selects "Delete message" from the context menu.
   * Should handle removing the message from the conversation.
   */
  onDelete: () => void;

  /**
   * Optional handler for the regenerate message action.
   * Called when the user selects "Regenerate" from the context menu.
   * Only available when canRegenerate is true. Should handle re-generating
   * the message content with potentially different results.
   */
  onRegenerate?: () => void;

  /**
   * Whether the message can be regenerated.
   * Controls the visibility of the regenerate option in the context menu.
   * When true, the "Regenerate" menu item will be shown. When false or
   * undefined, the regenerate option is hidden.
   *
   * @default false
   */
  canRegenerate?: boolean;

  /**
   * Optional CSS class name for additional styling.
   * Applied to the root container element of the message context menu.
   * Allows for custom styling beyond the default theme-aware styling.
   */
  className?: string;
}
