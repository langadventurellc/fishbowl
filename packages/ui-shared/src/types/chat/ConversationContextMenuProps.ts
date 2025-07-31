/**
 * Props interface for ConversationContextMenu component.
 *
 * Defines the properties needed for conversation-specific context menu functionality.
 * Follows the same pattern as MessageContextMenuProps but tailored for conversation
 * actions like rename, duplicate, and delete.
 *
 * @module types/ui/components/ConversationContextMenuProps
 */

import { ConversationViewModel } from "../ConversationViewModel";

/**
 * Props interface for the ConversationContextMenu component.
 *
 * This interface defines the properties needed for conversation-specific context menu
 * functionality. It follows the MessageContextMenu pattern but provides conversation-
 * specific actions like rename, duplicate, and delete operations.
 *
 * The component uses the generic ContextMenu component internally while providing
 * conversation-specific menu items and actions. This creates a clean separation
 * between generic menu functionality and conversation-specific business logic.
 *
 * @example
 * ```typescript
 * // Basic usage with all conversation actions
 * <ConversationContextMenu
 *   conversation={conversation}
 *   onRename={() => handleRename(conversation.id)}
 *   onDuplicate={() => handleDuplicate(conversation)}
 *   onDelete={() => handleDelete(conversation.id)}
 * />
 *
 * // With positioning and custom styling
 * <ConversationContextMenu
 *   conversation={conversation}
 *   position="above"
 *   onRename={handleRename}
 *   onDuplicate={handleDuplicate}
 *   onDelete={handleDelete}
 *   className="custom-menu-style"
 * />
 * ```
 */
export interface ConversationContextMenuProps {
  /**
   * The conversation data for which the context menu is displayed.
   * Used to provide context for menu items and determine available actions.
   * Conversation properties may affect which menu options are enabled or visible.
   */
  conversation: ConversationViewModel;

  /**
   * Positioning preference for the menu relative to trigger element.
   * - "above": Menu appears above the trigger
   * - "below": Menu appears below the trigger
   *
   * @default "below"
   */
  position?: "above" | "below";

  /**
   * Handler for the rename conversation action.
   * Called when the user selects "Rename" from the context menu.
   * Should handle renaming the conversation, typically by opening a rename dialog
   * or inline editing interface.
   */
  onRename: () => void;

  /**
   * Handler for the duplicate conversation action.
   * Called when the user selects "Duplicate" from the context menu.
   * Should handle creating a copy of the conversation with similar settings
   * and agents but starting with a clean message history.
   */
  onDuplicate: () => void;

  /**
   * Handler for the delete conversation action.
   * Called when the user selects "Delete" from the context menu.
   * Should handle removing the conversation from the conversation list,
   * typically with a confirmation dialog for safety.
   */
  onDelete: () => void;

  /**
   * Optional CSS class name for additional styling.
   * Applied to the root container element of the conversation context menu.
   * Allows for custom styling beyond the default theme-aware styling.
   */
  className?: string;
}
