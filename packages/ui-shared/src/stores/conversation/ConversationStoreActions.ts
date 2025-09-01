/**
 * Actions interface for the conversation store.
 *
 * Defines all store operations including conversation management, message operations,
 * and agent coordination. All async operations use plain immutable updates and
 * convert service errors to ErrorState patterns.
 */

import type { ConversationService } from "@fishbowl-ai/shared";

export interface ConversationStoreActions {
  /**
   * Initialize the store with a ConversationService implementation.
   * Enables dependency injection for platform-specific service adapters.
   */
  initialize(service: ConversationService): void;

  /**
   * Load and cache the complete conversation list.
   * Updates conversations array and manages loading/error states.
   */
  loadConversations(): Promise<void>;

  /**
   * Select a conversation as active, loading its messages and agents.
   * Passing null clears the active conversation and associated chat state.
   * Automatically clears chat store state for clean conversation switching.
   */
  selectConversation(id: string | null): Promise<void>;

  /**
   * Create a new conversation and immediately select it as active.
   * Atomic operation that handles creation, list refresh, and selection.
   */
  createConversationAndSelect(title?: string): Promise<void>;

  /**
   * Reload data for the currently active conversation.
   * Refreshes messages and agents with race condition protection.
   * No-op if no conversation is currently active.
   */
  refreshActiveConversation(): Promise<void>;

  /**
   * Create and send a user message, then trigger agent orchestration.
   * Handles message creation, conversation refresh, and orchestration initiation.
   * Uses continuation logic for empty content messages.
   */
  sendUserMessage(content?: string): Promise<void>;

  /**
   * Add an agent to a specific conversation.
   * Updates the conversation's agent list and refreshes active agents if needed.
   */
  addAgent(conversationId: string, agentId: string): Promise<void>;

  /**
   * Remove an agent from a specific conversation.
   * Updates the conversation's agent list and refreshes active agents if needed.
   */
  removeAgent(conversationId: string, agentId: string): Promise<void>;

  /**
   * Toggle the enabled state of a conversation agent.
   * Enables or disables agent participation in the conversation.
   */
  toggleAgentEnabled(conversationAgentId: string): Promise<void>;
}
