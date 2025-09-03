/**
 * Actions interface for the conversation store.
 *
 * Defines all store operations including conversation management, message operations,
 * and agent coordination. All async operations use plain immutable updates and
 * convert service errors to ErrorState patterns.
 */

import type { ConversationService } from "@fishbowl-ai/shared";
import type { ChatModeIntent } from "../../types/chat-modes/ChatModeIntent";

// Platform-specific imports with conditional typing
type AgentUpdateEvent = {
  conversationId: string;
  conversationAgentId: string;
  status: "thinking" | "complete" | "error";
  messageId?: string;
  error?: string;
  agentName?: string;
  errorType?:
    | "network"
    | "auth"
    | "rate_limit"
    | "validation"
    | "provider"
    | "timeout"
    | "unknown";
  retryable?: boolean;
};

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
   * Get the chat mode of the currently active conversation.
   * Returns the chat mode ('manual' | 'round-robin') if there is an active conversation,
   * or null if no conversation is selected or the conversation is not found.
   * Provides reactive updates when conversation selection changes.
   */
  getActiveChatMode(): "manual" | "round-robin" | null;

  /**
   * Update the chat mode of the currently active conversation.
   * Handles the complete workflow of updating the conversation via the service layer
   * and enforcing mode rules. For Round Robin mode, immediately enforces the
   * single-enabled invariant by disabling all but the first enabled agent.
   *
   * @param chatMode - The new chat mode to set ('manual' | 'round-robin')
   */
  setChatMode(chatMode: "manual" | "round-robin"): Promise<void>;

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

  /**
   * Process chat mode handler intents into actual agent state updates.
   *
   * Takes an intent object from a chat mode handler and executes the
   * necessary service calls to enable/disable agents as specified.
   * Updates the store state in-place using the returned agent payloads.
   *
   * @param intent - Intent object specifying which agents to enable/disable
   */
  processAgentIntent(intent: ChatModeIntent): Promise<void>;

  /**
   * Private helper for enforcing Round Robin invariant.
   * Ensures only one agent is enabled at a time by keeping the first enabled agent
   * by rotation order and disabling all others.
   */
  enforceRoundRobinInvariant(): Promise<void>;

  /**
   * Handle conversation progression for automatic agent rotation in Round Robin mode.
   *
   * Only processes Round Robin mode conversations, performing no-op for manual mode.
   * Delegates to the appropriate chat mode handler to determine next agent rotation
   * and processes the returned intent through the existing processAgentIntent helper.
   * Handles edge cases like single agent, no enabled agents, and empty conversations.
   */
  handleConversationProgression(): Promise<void>;

  /**
   * Subscribe to real-time agent update events for the active conversation.
   * Platform-specific implementation - returns cleanup function for desktop, null for unsupported platforms.
   * Enables direct conversationId filtering and real-time activeMessages updates.
   */
  subscribeToAgentUpdates(
    callback?: (event: AgentUpdateEvent) => void,
  ): (() => void) | null;
}
