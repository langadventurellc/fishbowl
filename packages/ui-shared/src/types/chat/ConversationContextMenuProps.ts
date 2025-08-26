import { ConversationViewModel } from "../ConversationViewModel";

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
