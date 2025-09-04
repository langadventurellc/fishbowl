import type {
  Conversation as _Conversation,
  Message as _Message,
  ConversationAgent as _ConversationAgent,
  CreateMessageInput as _CreateMessageInput,
  UpdateConversationInput as _UpdateConversationInput,
} from "@fishbowl-ai/shared";

/**
 * Platform-agnostic service interface for conversation operations
 *
 * Provides clean abstraction over platform-specific IPC calls, enabling
 * the conversation domain store to work independently of window.electronAPI.
 *
 * Method signatures exactly match current IPC surface for seamless integration.
 * All methods throw errors (no ErrorState at interface level).
 *
 * This interface follows the Platform Abstraction Pattern:
 * - Interface defined in shared package
 * - Platform-specific implementations in app directories
 * - Business logic remains platform-independent
 * - Dependency injection enables clean testing and platform switching
 */
export interface ConversationService {
  /**
   * Trigger agent orchestration for a user message
   * Maps to: window.electronAPI.chat.sendToAgents(conversationId, userMessageId)
   *
   * Initiates the agent response generation process for enabled agents in the conversation.
   * This method starts the orchestration but does not wait for agent responses - responses
   * are delivered asynchronously via agent update events.
   *
   * @param conversationId - Conversation UUID where orchestration should occur
   * @param userMessageId - User message UUID that triggered the orchestration
   * @returns Promise resolving to void when orchestration is successfully initiated
   * @throws Error on orchestration failure, invalid IDs, or no enabled agents
   */
  sendToAgents(conversationId: string, userMessageId: string): Promise<void>;

  // Conversation CRUD Operations - exact IPC alignment

  /**
   * List all conversations for the current user
   * Maps to: window.electronAPI.conversations.list()
   *
   * Retrieves all conversations ordered by most recent activity.
   * Returns empty array if no conversations exist.
   *
   * @returns Promise resolving to array of conversations
   * @throws Error on retrieval failure or database connection issues
   */
  listConversations(): Promise<_Conversation[]>;

  /**
   * Get a specific conversation by ID
   * Maps to: window.electronAPI.conversations.get(id)
   *
   * Retrieves conversation details for the specified ID.
   * Returns null if conversation does not exist or was deleted.
   *
   * @param id - Conversation UUID to retrieve
   * @returns Promise resolving to conversation or null if not found
   * @throws Error on retrieval failure or invalid ID format
   */
  getConversation(id: string): Promise<_Conversation | null>;

  /**
   * Create a new conversation
   * Maps to: window.electronAPI.conversations.create(title?)
   *
   * Creates a new conversation with generated UUID and timestamps.
   * If no title provided, generates default title based on creation time.
   *
   * @param title - Optional conversation title (defaults to generated title)
   * @returns Promise resolving to created conversation
   * @throws Error on creation failure or database constraint violations
   */
  createConversation(title?: string): Promise<_Conversation>;

  /**
   * Update conversation (primarily for renaming)
   * Maps to: window.electronAPI.conversations.update(id, input)
   *
   * Updates conversation properties, primarily used for title changes.
   * This method provides a simplified interface over the generic update operation.
   *
   * @param id - Conversation UUID to update
   * @param title - New conversation title
   * @returns Promise resolving to updated conversation
   * @throws Error on update failure, conversation not found, or invalid parameters
   */
  renameConversation(id: string, title: string): Promise<_Conversation>;

  /**
   * Update conversation properties including chat_mode and title
   * Maps to: window.electronAPI.conversations.update(id, updates)
   *
   * Updates conversation properties including title and chat_mode fields.
   * Supports updating either field independently or both together in a single operation.
   * All updates are validated using updateConversationInputSchema before processing.
   *
   * @param id - Conversation UUID to update
   * @param updates - UpdateConversationInput with optional title and chat_mode fields
   * @returns Promise resolving to updated conversation with all fields
   * @throws Error on update failure, conversation not found, or invalid parameters
   */
  updateConversation(
    id: string,
    updates: _UpdateConversationInput,
  ): Promise<_Conversation>;

  /**
   * Delete a conversation permanently
   * Maps to: window.electronAPI.conversations.delete(id)
   *
   * Permanently removes conversation and all associated messages and agent relationships.
   * This operation cannot be undone.
   *
   * @param id - Conversation UUID to delete
   * @returns Promise resolving to void on successful deletion
   * @throws Error on deletion failure or conversation not found
   */
  deleteConversation(id: string): Promise<void>;

  // ConversationAgent Operations - exact IPC alignment

  /**
   * List all agents assigned to a specific conversation
   * Maps to: window.electronAPI.conversationAgent.getByConversation(conversationId)
   * @param conversationId - Conversation UUID to retrieve agents for
   * @returns Promise resolving to array of conversation agents with their configurations
   * @throws Error on retrieval failure or invalid conversation ID
   */
  listConversationAgents(conversationId: string): Promise<_ConversationAgent[]>;

  /**
   * Add an agent to a conversation
   * Maps to: window.electronAPI.conversationAgent.add({conversation_id, agent_id})
   * @param conversationId - Conversation UUID to add agent to
   * @param agentId - Agent UUID to add to the conversation
   * @returns Promise resolving to created conversation agent relationship
   * @throws Error on creation failure, duplicate assignment, or invalid IDs
   */
  addAgent(
    conversationId: string,
    agentId: string,
  ): Promise<_ConversationAgent>;

  /**
   * Remove an agent from a conversation
   * Maps to: window.electronAPI.conversationAgent.remove({conversation_id, agent_id})
   * @param conversationId - Conversation UUID to remove agent from
   * @param agentId - Agent UUID to remove from the conversation
   * @returns Promise resolving to void on successful removal
   * @throws Error on removal failure or relationship not found
   */
  removeAgent(conversationId: string, agentId: string): Promise<void>;

  /**
   * Update conversation agent configuration (primarily for enabling/disabling)
   * Maps to: window.electronAPI.conversationAgent.update({conversationAgentId, updates})
   * @param conversationAgentId - ConversationAgent relationship UUID
   * @param updates - Partial ConversationAgent updates (typically {enabled: boolean})
   * @returns Promise resolving to updated conversation agent
   * @throws Error on update failure or relationship not found
   */
  updateConversationAgent(
    conversationAgentId: string,
    updates: Partial<_ConversationAgent>,
  ): Promise<_ConversationAgent>;

  // Message Operations - exact IPC alignment (NO pagination complexity)

  /**
   * List all messages for a specific conversation
   * Maps to: window.electronAPI.messages.list(conversationId)
   *
   * Retrieves all messages for the conversation in chronological order.
   * Returns empty array if conversation has no messages.
   * No pagination - simple client-side capping applies.
   *
   * @param conversationId - Conversation UUID to retrieve messages for
   * @returns Promise resolving to array of messages in chronological order
   * @throws Error on retrieval failure or invalid conversation ID
   */
  listMessages(conversationId: string): Promise<_Message[]>;

  /**
   * Create a new message in a conversation
   * Maps to: window.electronAPI.messages.create(input)
   *
   * Creates a new message with generated UUID and timestamps.
   * Validates CreateMessageInput according to existing schema validation.
   * Handles user, agent, and system message types properly.
   *
   * @param input - CreateMessageInput with conversation_id, role, content, etc.
   * @returns Promise resolving to created message with generated ID and timestamps
   * @throws Error on creation failure or validation errors
   */
  createMessage(input: _CreateMessageInput): Promise<_Message>;

  /**
   * Delete a message permanently
   * Maps to: window.electronAPI.messages.delete(id)
   *
   * Permanently removes message from conversation.
   * This operation cannot be undone.
   *
   * @param id - Message UUID to delete
   * @returns Promise resolving to void on successful deletion
   * @throws Error on deletion failure or message not found
   */
  deleteMessage(id: string): Promise<void>;
}
