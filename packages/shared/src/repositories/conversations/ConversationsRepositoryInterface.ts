import type { Conversation } from "../../types/conversations";
import type { CreateConversationInput } from "../../types/conversations";
import type { UpdateConversationInput } from "../../types/conversations";

/**
 * Repository interface for conversation persistence operations.
 *
 * Provides CRUD operations for managing conversations in the database
 * with business logic validation and error handling.
 */
export interface ConversationsRepositoryInterface {
  /**
   * Create a new conversation with auto-generated ID and timestamps.
   *
   * @param input - Creation input with optional title
   * @returns Promise resolving to the created conversation
   * @throws ConversationValidationError if input is invalid
   */
  create(input: CreateConversationInput): Promise<Conversation>;

  /**
   * Retrieve a conversation by ID.
   *
   * @param id - Conversation UUID to retrieve
   * @returns Promise resolving to the conversation
   * @throws ConversationNotFoundError if not found
   */
  get(id: string): Promise<Conversation>;

  /**
   * List all conversations ordered by creation date.
   *
   * @returns Promise resolving to array of conversations
   */
  list(): Promise<Conversation[]>;

  /**
   * Update an existing conversation.
   *
   * @param id - Conversation UUID to update
   * @param input - Update input with fields to change
   * @returns Promise resolving to updated conversation
   * @throws ConversationNotFoundError if not found
   * @throws ConversationValidationError if input is invalid
   */
  update(id: string, input: UpdateConversationInput): Promise<Conversation>;

  /**
   * Delete a conversation by ID.
   *
   * @param id - Conversation UUID to delete
   * @returns Promise resolving when deletion is complete
   * @throws ConversationNotFoundError if not found
   */
  delete(id: string): Promise<void>;

  /**
   * Check if a conversation exists.
   *
   * @param id - Conversation UUID to check
   * @returns Promise resolving to existence boolean
   */
  exists(id: string): Promise<boolean>;
}
