import type {
  Conversation as _Conversation,
  Message as _Message,
  ConversationAgent as _ConversationAgent,
  CreateMessageInput as _CreateMessageInput,
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
}
