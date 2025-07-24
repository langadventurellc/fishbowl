/**
 * Conversation interface for conversation UI system.
 *
 * Represents a conversation session with metadata for
 * identification, activity tracking, and state management.
 *
 * @module types/ui/core/Conversation
 */

/**
 * Represents a conversation session in the conversation UI system.
 *
 * This interface defines the structure for conversation entities displayed
 * in the sidebar conversation list, including identification, activity
 * timestamps, and current selection state for navigation.
 *
 * @example
 * ```typescript
 * const activeConversation: Conversation = {
 *   name: "Project Planning",
 *   lastActivity: "2h ago",
 *   isActive: true  // Currently selected/viewing
 * };
 *
 * const previousConversations: Conversation[] = [
 *   {
 *     name: "Creative Writing",
 *     lastActivity: "Yesterday",
 *     isActive: false
 *   },
 *   {
 *     name: "Code Review",
 *     lastActivity: "Dec 15",
 *     isActive: false
 *   }
 * ];
 * ```
 */
export interface Conversation {
  /**
   * Display name of the conversation.
   * Used in the sidebar conversation list for identification and selection.
   * Should be descriptive of the conversation topic or purpose.
   *
   * @example "Project Planning", "Creative Writing", "Code Review"
   */
  name: string;

  /**
   * Human-readable timestamp of the last activity in this conversation.
   * Displayed in the sidebar under the conversation name to show recency.
   * Format can vary based on how recent the activity was.
   *
   * @example "2h ago", "Yesterday", "Dec 15", "Last week"
   */
  lastActivity: string;

  /**
   * Whether this conversation is currently active/selected.
   * Controls visual highlighting in the sidebar and determines which
   * conversation's messages are displayed in the main chat area.
   *
   * Only one conversation should be active at a time.
   */
  isActive: boolean;
}
