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
}
