/**
 * Conversations operations for managing conversation data.
 * Provides CRUD operations for conversations through IPC handlers.
 */
export interface ConversationsAPI {
  /**
   * Create a new conversation.
   * @param title - Optional conversation title
   * @returns Promise resolving to created conversation
   */
  create(title?: string): Promise<import("@fishbowl-ai/shared").Conversation>;
  /**
   * List all conversations ordered by creation date.
   * @returns Promise resolving to array of conversations
   */
  list(): Promise<import("@fishbowl-ai/shared").Conversation[]>;
  /**
   * Get a specific conversation by ID.
   * @param id - Conversation ID
   * @returns Promise resolving to conversation or null if not found
   */
  get(id: string): Promise<import("@fishbowl-ai/shared").Conversation | null>;
  /**
   * Update an existing conversation.
   * @param id - Conversation ID
   * @param updates - Partial conversation updates
   * @returns Promise resolving to updated conversation
   */
  update?(
    id: string,
    updates: import("@fishbowl-ai/shared").UpdateConversationInput,
  ): Promise<import("@fishbowl-ai/shared").Conversation>;
  /**
   * Delete a conversation.
   * @param id - Conversation ID
   * @returns Promise resolving to boolean indicating success
   */
  delete?(id: string): Promise<boolean>;
}
