/**
 * ConversationItemProps interface for sidebar conversation list component.
 *
 * Defines the props contract for the ConversationItem component that displays
 * conversation entries in the sidebar with selection and context menu support.
 *
 * @module types/ui/components/ConversationItemProps
 */

import { ConversationViewModel } from "../core/ConversationViewModel";

/**
 * Props interface for the ConversationItem component.
 *
 * This interface defines the properties required for displaying conversation
 * entries in the sidebar conversation list, including conversation data,
 * selection state management, and context menu interactions.
 *
 * @example
 * ```typescript
 * const conversationProps: ConversationItemProps = {
 *   conversation: {
 *     name: "Project Planning",
 *     lastActivity: "2h ago",
 *     isActive: true
 *   },
 *   contextMenuOpen: false,
 *   onSelect: (conversationName) => {
 *     console.log(`Selected conversation: ${conversationName}`);
 *   },
 *   onContextMenuAction: (action, conversationName) => {
 *     console.log(`Context menu action: ${action} for conversation: ${conversationName}`);
 *   },
 *   onOpenContextMenu: (conversationName) => {
 *     console.log(`Open context menu for conversation: ${conversationName}`);
 *   }
 * };
 *
 * // Inactive conversation example
 * const inactiveConversationProps: ConversationItemProps = {
 *   conversation: {
 *     name: "Creative Writing",
 *     lastActivity: "Yesterday",
 *     isActive: false
 *   },
 *   contextMenuOpen: false,
 *   onSelect: (name) => switchToConversation(name)
 * };
 * ```
 */
export interface ConversationItemProps {
  /**
   * The conversation data to display.
   * Contains all necessary information for rendering the conversation item
   * including name, last activity timestamp, and current selection state.
   *
   * The isActive property controls the visual highlighting to indicate
   * which conversation is currently selected and displayed.
   */
  conversation: ConversationViewModel;

  /**
   * Whether the context menu is currently open for this conversation.
   * Controls the visual state of the context menu button and menu visibility.
   * Used for managing which conversation's context menu is active.
   */
  contextMenuOpen: boolean;

  /**
   * Handler for conversation selection.
   * Called when the user clicks on the conversation item to select it.
   * This should update the active conversation and display its messages
   * in the main chat area.
   *
   * @param conversationName - The name of the selected conversation
   */
  onSelect: (conversationName: string) => void;

  /**
   * Handler for context menu actions.
   * Called when the user selects an action from the conversation context menu.
   * Common actions include "rename", "duplicate", and "delete".
   *
   * @param action - The selected action (e.g., "rename", "duplicate", "delete")
   * @param conversationName - The name of the conversation the action applies to
   */
  onContextMenuAction: (action: string, conversationName: string) => void;

  /**
   * Handler for opening/closing the context menu.
   * Called when the user clicks the context menu button (ellipsis icon).
   * Receives the conversation name when opening a menu, or null when closing.
   *
   * @param conversationName - The name of the conversation to open menu for, or null to close
   */
  onOpenContextMenu: (conversationName: string | null) => void;

  /**
   * Optional CSS class name for additional styling.
   * Allows for custom styling of the conversation item component
   * beyond the default theme-aware styling.
   *
   * Applied to the root element of the conversation item component.
   *
   * @example "custom-conversation", "pinned", "recent"
   */
  className?: string;
}
