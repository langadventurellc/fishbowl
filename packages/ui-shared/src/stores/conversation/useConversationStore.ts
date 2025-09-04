/**
 * Core conversation store with Zustand and service injection.
 *
 * Manages complete conversation lifecycle including conversation list management,
 * message operations, agent coordination, and service integration with race
 * condition protection and dependency injection.
 */

import { create } from "zustand";
import type { ConversationStore } from "./ConversationStore";
import type {
  ConversationService,
  Message,
  ConversationAgent,
  UpdateConversationInput,
} from "@fishbowl-ai/shared";
import { useChatStore } from "../chat/useChatStore";
import { createChatModeHandler } from "../../chat-modes";
import type { ChatModeIntent } from "../../types/chat-modes/ChatModeIntent";

// Platform-specific event type for desktop integration
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

/**
 * Generate unique request token for race condition protection.
 * Uses crypto.randomUUID() when available, falls back to timestamp + random.
 */
const generateRequestToken = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Apply message limit with client-side trimming.
 * Keeps most recent messages and maintains chronological order.
 */
const applyMessageLimit = (messages: Message[], limit: number): Message[] => {
  if (limit <= 0 || messages.length <= limit) {
    return messages;
  }
  // Keep most recent messages, maintain chronological order
  return messages.slice(-limit);
};

// Private service reference for dependency injection
let conversationService: ConversationService | null = null;
// Event subscription cleanup reference
let eventCleanupRef: (() => void) | null = null;

export const useConversationStore = create<ConversationStore>()((set, get) => ({
  // Initial state - all arrays empty, loading states false
  activeConversationId: null,
  conversations: [],
  activeMessages: [],
  activeConversationAgents: [],
  activeRequestToken: null,
  maximumMessages: 100,
  // Event subscription state
  eventSubscription: {
    isSubscribed: false,
    lastEventTime: null,
  },

  // Loading states
  loading: {
    conversations: false,
    messages: false,
    agents: false,
    sending: false,
  },

  // Error states
  error: {
    conversations: undefined,
    messages: undefined,
    agents: undefined,
    sending: undefined,
  },

  // Actions

  /**
   * Initialize store with ConversationService dependency injection.
   */
  initialize: (service: ConversationService) => {
    conversationService = service;
  },

  /**
   * Load conversation list with loading states and error handling.
   */
  loadConversations: async () => {
    if (!conversationService) {
      throw new Error("ConversationService not initialized");
    }

    try {
      set((state) => ({
        ...state,
        loading: { ...state.loading, conversations: true },
        error: { ...state.error, conversations: undefined },
      }));

      const conversations = await conversationService.listConversations();

      set((state) => ({
        ...state,
        conversations,
        loading: { ...state.loading, conversations: false },
      }));
    } catch (error) {
      set((state) => ({
        ...state,
        loading: { ...state.loading, conversations: false },
        error: {
          ...state.error,
          conversations: {
            message:
              error instanceof Error
                ? error.message
                : "Failed to load conversations",
            operation: "load",
            isRetryable: true,
            retryCount: 0,
            timestamp: new Date().toISOString(),
          },
        },
      }));
    }
  },

  /**
   * Switch active conversation with race condition protection and chat state clearing.
   */
  selectConversation: async (id: string | null) => {
    if (!conversationService) {
      throw new Error("ConversationService not initialized");
    }

    // Generate request token for race condition protection
    const requestToken = generateRequestToken();

    // Clean up previous event subscription when switching conversations
    if (eventCleanupRef) {
      eventCleanupRef();
      eventCleanupRef = null;
      set((state) => ({
        ...state,
        eventSubscription: {
          ...state.eventSubscription,
          isSubscribed: false,
        },
      }));
    }

    try {
      set((state) => ({
        ...state,
        activeConversationId: id,
        activeRequestToken: requestToken,
        activeMessages: [],
        activeConversationAgents: [],
        loading: { ...state.loading, messages: true, agents: true },
        error: { ...state.error, messages: undefined, agents: undefined },
      }));

      // Clear chat store state
      useChatStore.getState().clearConversationState();

      // Early return if null selection
      if (id === null) {
        set((state) => ({
          ...state,
          loading: { ...state.loading, messages: false, agents: false },
        }));
        return;
      }

      // Load conversation data
      const [messages, agents] = await Promise.all([
        conversationService.listMessages(id),
        conversationService.listConversationAgents(id),
      ]);

      // Check if this request is still current
      const currentState = get();
      if (currentState.activeRequestToken !== requestToken) {
        return; // Ignore stale result
      }

      // Apply message limit if configured
      const trimmedMessages =
        currentState.maximumMessages > 0 &&
        messages.length > currentState.maximumMessages
          ? messages.slice(-currentState.maximumMessages)
          : messages;

      set((state) => ({
        ...state,
        activeMessages: trimmedMessages,
        activeConversationAgents: agents,
        loading: { ...state.loading, messages: false, agents: false },
      }));
    } catch (error) {
      // Check if this request is still current before setting error
      const currentState = get();
      if (currentState.activeRequestToken !== requestToken) {
        return; // Ignore stale error
      }

      set((state) => ({
        ...state,
        loading: { ...state.loading, messages: false, agents: false },
        error: {
          ...state.error,
          messages: {
            message:
              error instanceof Error
                ? error.message
                : "Failed to load conversation data",
            operation: "load",
            isRetryable: true,
            retryCount: 0,
            timestamp: new Date().toISOString(),
          },
        },
      }));
    }
  },

  /**
   * Get the chat mode of the currently active conversation.
   * Returns 'manual' or 'round-robin' if there is an active conversation,
   * or null if no conversation is selected or the conversation is not found.
   * Provides reactive updates when conversation selection changes.
   */
  getActiveChatMode: (): "manual" | "round-robin" | null => {
    const { activeConversationId, conversations } = get();
    if (!activeConversationId) return null;

    const conversation = conversations.find(
      (c) => c.id === activeConversationId,
    );
    return conversation?.chat_mode || null;
  },

  setChatMode: async (chatMode: "manual" | "round-robin") => {
    const { activeConversationId } = get();
    if (!activeConversationId || !conversationService) return;

    try {
      // Update via service layer using UpdateConversationInput
      const updatedConversation = await conversationService.updateConversation(
        activeConversationId,
        { chat_mode: chatMode } as UpdateConversationInput,
      );

      // Update local state
      set((state) => ({
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === activeConversationId ? updatedConversation : c,
        ),
      }));

      // Immediately enforce mode rules
      if (chatMode === "round-robin") {
        await get().enforceRoundRobinInvariant();
      }
    } catch (error) {
      // Handle errors with proper error state
      set((state) => ({
        ...state,
        error: {
          ...state.error,
          agents: {
            message: `Failed to update chat mode: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            operation: "save",
            isRetryable: true,
            retryCount: 0,
            timestamp: new Date().toISOString(),
          },
        },
      }));
    }
  },

  /**
   * Private helper for enforcing Round Robin invariant.
   * Ensures only one agent is enabled at a time by keeping the first enabled agent
   * by rotation order and disabling all others.
   */
  enforceRoundRobinInvariant: async () => {
    const { activeConversationAgents } = get();
    const enabledAgents = activeConversationAgents.filter((a) => a.enabled);

    if (enabledAgents.length <= 1) return; // Already compliant

    // Keep first enabled agent by rotation order
    const sortedAgents = activeConversationAgents.sort(
      (a, b) =>
        a.display_order - b.display_order ||
        new Date(a.added_at).getTime() - new Date(b.added_at).getTime(),
    );
    const firstEnabled = sortedAgents.find((a) => a.enabled);

    if (!firstEnabled) return;

    // Disable all others (no need to enable the already enabled agent)
    const intent: ChatModeIntent = {
      toEnable: [], // First enabled agent is already enabled
      toDisable: enabledAgents
        .filter((a) => a.id !== firstEnabled.id)
        .map((a) => a.id),
    };

    await get().processAgentIntent(intent);
  },

  /**
   * Atomic create and select operation.
   */
  createConversationAndSelect: async (title?: string) => {
    if (!conversationService) {
      throw new Error("ConversationService not initialized");
    }

    try {
      // Create conversation
      const conversation = await conversationService.createConversation(
        title || "New Conversation",
      );

      // Refresh conversation list
      await get().loadConversations();

      // Select the new conversation
      await get().selectConversation(conversation.id);
    } catch (error) {
      set((state) => ({
        ...state,
        error: {
          ...state.error,
          conversations: {
            message:
              error instanceof Error
                ? error.message
                : "Failed to create conversation",
            operation: "save",
            isRetryable: true,
            retryCount: 0,
            timestamp: new Date().toISOString(),
          },
        },
      }));
    }
  },

  /**
   * Reload active conversation data with race protection.
   */
  refreshActiveConversation: async () => {
    const { activeConversationId } = get();
    if (!activeConversationId) {
      return; // No-op when no active conversation
    }

    await get().selectConversation(activeConversationId);
  },

  /**
   * Send user message and trigger orchestration.
   */
  sendUserMessage: async (content?: string) => {
    if (!conversationService) {
      throw new Error("ConversationService not initialized");
    }

    const { activeConversationId } = get();
    if (!activeConversationId) {
      return;
    }

    // Generate request token for race condition protection
    const requestToken = generateRequestToken();

    try {
      set((state) => ({
        ...state,
        activeRequestToken: requestToken,
        loading: { ...state.loading, sending: true },
        error: { ...state.error, sending: undefined },
      }));

      // Create message - handle continuation vs regular user message
      let messageToCreate;
      if (content?.trim()) {
        // Regular user message
        messageToCreate = {
          conversation_id: activeConversationId,
          content: content.trim(),
          role: "user" as const,
        };
      } else {
        // Continuation system message (not included in API calls)
        messageToCreate = {
          conversation_id: activeConversationId,
          content: "[Continue conversation]",
          role: "system" as const,
          included: false,
        };
      }

      const userMessage =
        await conversationService.createMessage(messageToCreate);

      // Add created message to activeMessages and apply limit
      const currentState = get();
      if (currentState.activeRequestToken === requestToken) {
        const updatedMessages = applyMessageLimit(
          [...currentState.activeMessages, userMessage],
          currentState.maximumMessages,
        );
        set((state) => ({ ...state, activeMessages: updatedMessages }));

        // Trigger orchestration
        await conversationService.sendToAgents(
          activeConversationId,
          userMessage.id,
        );
      }

      set((state) => ({
        ...state,
        loading: { ...state.loading, sending: false },
      }));
    } catch (error) {
      set((state) => ({
        ...state,
        loading: { ...state.loading, sending: false },
        error: {
          ...state.error,
          sending: {
            message:
              error instanceof Error ? error.message : "Failed to send message",
            operation: "save",
            isRetryable: true,
            retryCount: 0,
            timestamp: new Date().toISOString(),
          },
        },
      }));
    }
  },

  /**
   * Load messages for active conversation with memory management.
   */
  loadMessages: async (conversationId: string) => {
    if (!conversationService) {
      throw new Error("ConversationService not initialized");
    }

    // Generate request token for race condition protection
    const requestToken = generateRequestToken();

    try {
      set((state) => ({
        ...state,
        activeRequestToken: requestToken,
        activeMessages: [], // Clear existing messages
        loading: { ...state.loading, messages: true },
        error: { ...state.error, messages: undefined },
      }));

      // Load messages from service
      const messages = await conversationService.listMessages(conversationId);

      // Check if this request is still current
      const currentState = get();
      if (currentState.activeRequestToken !== requestToken) {
        return; // Ignore stale result
      }

      // Apply message limit with client-side trimming
      const trimmedMessages = applyMessageLimit(
        messages,
        currentState.maximumMessages,
      );

      set((state) => ({
        ...state,
        activeMessages: trimmedMessages,
        loading: { ...state.loading, messages: false },
      }));
    } catch (error) {
      // Check if this request is still current before setting error
      const currentState = get();
      if (currentState.activeRequestToken !== requestToken) {
        return; // Ignore stale error
      }

      set((state) => ({
        ...state,
        loading: { ...state.loading, messages: false },
        error: {
          ...state.error,
          messages: {
            message:
              error instanceof Error
                ? error.message
                : "Failed to load messages",
            operation: "load",
            isRetryable: true,
            retryCount: 0,
            timestamp: new Date().toISOString(),
          },
        },
      }));
    }
  },

  /**
   * Delete message from conversation.
   */
  deleteMessage: async (id: string) => {
    if (!conversationService) {
      throw new Error("ConversationService not initialized");
    }

    try {
      set((state) => ({
        ...state,
        loading: { ...state.loading, messages: true },
        error: { ...state.error, messages: undefined },
      }));

      // Delete message from service
      await conversationService.deleteMessage(id);

      // Remove message from activeMessages array
      set((state) => ({
        ...state,
        activeMessages: state.activeMessages.filter(
          (message) => message.id !== id,
        ),
        loading: { ...state.loading, messages: false },
      }));
    } catch (error) {
      set((state) => ({
        ...state,
        loading: { ...state.loading, messages: false },
        error: {
          ...state.error,
          messages: {
            message:
              error instanceof Error
                ? error.message
                : "Failed to delete message",
            operation: "save",
            isRetryable: true,
            retryCount: 0,
            timestamp: new Date().toISOString(),
          },
        },
      }));
    }
  },

  /**
   * Load agents for active conversation.
   */
  loadConversationAgents: async (conversationId: string) => {
    if (!conversationService) {
      throw new Error("ConversationService not initialized");
    }

    // Generate request token for race condition protection
    const requestToken = generateRequestToken();

    try {
      set((state) => ({
        ...state,
        activeRequestToken: requestToken,
        activeConversationAgents: [], // Clear existing agents
        loading: { ...state.loading, agents: true },
        error: { ...state.error, agents: undefined },
      }));

      // Load agents from service
      const agents =
        await conversationService.listConversationAgents(conversationId);

      // Check if request is still current before updating
      const currentState = get();
      if (currentState.activeRequestToken === requestToken) {
        set((state) => ({
          ...state,
          activeConversationAgents: agents,
          loading: { ...state.loading, agents: false },
        }));
      }
    } catch (error) {
      // Only update error if request is still current
      const currentState = get();
      if (currentState.activeRequestToken === requestToken) {
        set((state) => ({
          ...state,
          loading: { ...state.loading, agents: false },
          error: {
            ...state.error,
            agents: {
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to load agents",
              operation: "load",
              isRetryable: true,
              retryCount: 0,
              timestamp: new Date().toISOString(),
            },
          },
        }));
      }
    }
  },

  /**
   * Add agent to conversation.
   */
  addAgent: async (conversationId: string, agentId: string) => {
    if (!conversationService || !get().activeConversationId) {
      return;
    }

    // Generate request token for race condition protection
    const requestToken = generateRequestToken();

    try {
      set((state) => ({
        ...state,
        activeRequestToken: requestToken,
        loading: { ...state.loading, agents: true },
        error: { ...state.error, agents: undefined },
      }));

      // Add agent via service
      const conversationAgent = await conversationService.addAgent(
        conversationId,
        agentId,
      );

      // Check if request is still current before updating
      const currentState = get();
      if (currentState.activeRequestToken === requestToken) {
        // Update store with new agent
        set((state) => ({
          ...state,
          activeConversationAgents: [
            ...state.activeConversationAgents,
            conversationAgent,
          ],
        }));

        // Apply chat mode rules to new agent
        try {
          const activeChatMode = get().getActiveChatMode();
          const { activeConversationAgents } = get();
          const chatModeHandler = createChatModeHandler(
            activeChatMode || "manual",
          );

          const intent = chatModeHandler.handleAgentAdded(
            activeConversationAgents,
            conversationAgent.id,
          );

          // Process intent for chat mode compliance
          await get().processAgentIntent(intent);
        } catch (chatModeError) {
          // Chat mode processing error should not prevent successful agent addition
          console.error("Chat mode processing failed:", chatModeError);
          set((state) => ({
            ...state,
            error: {
              ...state.error,
              agents: {
                message: `Agent added but chat mode processing failed: ${
                  chatModeError instanceof Error
                    ? chatModeError.message
                    : "Unknown error"
                }`,
                operation: "save",
                isRetryable: false,
                retryCount: 0,
                timestamp: new Date().toISOString(),
              },
            },
          }));
        } finally {
          // Clear loading state after all processing is complete
          set((state) => ({
            ...state,
            loading: { ...state.loading, agents: false },
          }));
        }
      }
    } catch (error) {
      // Only update error if request is still current
      const currentState = get();
      if (currentState.activeRequestToken === requestToken) {
        set((state) => ({
          ...state,
          loading: { ...state.loading, agents: false },
          error: {
            ...state.error,
            agents: {
              message:
                error instanceof Error ? error.message : "Failed to add agent",
              operation: "save",
              isRetryable: true,
              retryCount: 0,
              timestamp: new Date().toISOString(),
            },
          },
        }));
      }
    }
  },

  /**
   * Remove agent from conversation.
   */
  removeAgent: async (conversationId: string, agentId: string) => {
    if (!conversationService || !get().activeConversationId) {
      return;
    }

    try {
      set((state) => ({
        ...state,
        loading: { ...state.loading, agents: true },
        error: { ...state.error, agents: undefined },
      }));

      // Remove agent via service
      await conversationService.removeAgent(conversationId, agentId);

      // Remove agent from activeConversationAgents array
      set((state) => ({
        ...state,
        activeConversationAgents: state.activeConversationAgents.filter(
          (agent) => agent.agent_id !== agentId,
        ),
        loading: { ...state.loading, agents: false },
      }));
    } catch (error) {
      set((state) => ({
        ...state,
        loading: { ...state.loading, agents: false },
        error: {
          ...state.error,
          agents: {
            message:
              error instanceof Error ? error.message : "Failed to remove agent",
            operation: "save",
            isRetryable: true,
            retryCount: 0,
            timestamp: new Date().toISOString(),
          },
        },
      }));
    }
  },

  /**
   * Toggle agent enabled state.
   */
  toggleAgentEnabled: async (conversationAgentId: string) => {
    if (!conversationService || !get().activeConversationId) {
      return;
    }

    try {
      set((state) => ({
        ...state,
        loading: { ...state.loading, agents: true },
        error: { ...state.error, agents: undefined },
      }));

      // Get active chat mode and create handler
      const activeChatMode = get().getActiveChatMode();
      const { activeConversationAgents } = get();
      const chatModeHandler = createChatModeHandler(activeChatMode || "manual");

      // Get intent from handler
      const intent = chatModeHandler.handleAgentToggle(
        activeConversationAgents,
        conversationAgentId,
      );

      // Process intent into actual updates
      await get().processAgentIntent(intent);

      set((state) => ({
        ...state,
        loading: { ...state.loading, agents: false },
      }));
    } catch (error) {
      set((state) => ({
        ...state,
        loading: { ...state.loading, agents: false },
        error: {
          ...state.error,
          agents: {
            message:
              error instanceof Error ? error.message : "Failed to toggle agent",
            operation: "save",
            isRetryable: true,
            retryCount: 0,
            timestamp: new Date().toISOString(),
          },
        },
      }));
    }
  },

  /**
   * Process chat mode handler intents into actual agent state updates.
   *
   * Takes an intent object from a chat mode handler and executes the
   * necessary service calls to enable/disable agents as specified.
   * Updates the store state in-place using the returned agent payloads.
   *
   * @param intent - Intent object specifying which agents to enable/disable
   */
  processAgentIntent: async (intent: ChatModeIntent) => {
    if (!conversationService) return;

    try {
      // Process all disables first, then enables
      const updatedAgents: ConversationAgent[] = [];

      for (const agentId of intent.toDisable) {
        const updatedAgent = await conversationService.updateConversationAgent(
          agentId,
          { enabled: false },
        );
        updatedAgents.push(updatedAgent);
      }

      for (const agentId of intent.toEnable) {
        const updatedAgent = await conversationService.updateConversationAgent(
          agentId,
          { enabled: true },
        );
        updatedAgents.push(updatedAgent);
      }

      // Update store state in-place using returned agent payloads
      set((state) => ({
        ...state,
        activeConversationAgents: state.activeConversationAgents.map(
          (agent) => {
            const updated = updatedAgents.find((ua) => ua.id === agent.id);
            return updated || agent;
          },
        ),
      }));
    } catch (error) {
      // Handle errors with proper error state
      set((state) => ({
        ...state,
        error: {
          ...state.error,
          agents: {
            message: `Failed to apply chat mode changes: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            operation: "save",
            isRetryable: true,
            retryCount: 0,
            timestamp: new Date().toISOString(),
          },
        },
      }));
    }
  },

  /**
   * Handle conversation progression for automatic agent rotation in Round Robin mode.
   *
   * Only processes Round Robin mode conversations, performing no-op for manual mode.
   * Delegates to the appropriate chat mode handler to determine next agent rotation
   * and processes the returned intent through the existing processAgentIntent helper.
   * Handles edge cases like single agent, no enabled agents, and empty conversations.
   *
   * @returns Promise<void>
   */
  handleConversationProgression: async () => {
    const activeChatMode = get().getActiveChatMode();
    if (activeChatMode !== "round-robin") return; // No-op for manual mode

    const { activeConversationAgents } = get();
    const chatModeHandler = createChatModeHandler(activeChatMode);
    const intent = chatModeHandler.handleConversationProgression(
      activeConversationAgents,
    );

    await get().processAgentIntent(intent);
  },

  /**
   * Subscribe to real-time agent update events for the active conversation.
   */
  subscribeToAgentUpdates: (callback?: (event: AgentUpdateEvent) => void) => {
    // Platform detection - desktop only
    const electronWindow = window as unknown as {
      electronAPI?: {
        chat?: {
          onAgentUpdate?: (
            handler: (event: AgentUpdateEvent) => void,
          ) => () => void;
        };
      };
    };
    if (
      typeof window === "undefined" ||
      !electronWindow.electronAPI?.chat?.onAgentUpdate
    ) {
      return null; // Not available on this platform
    }

    // Handle agent update events with conversationId filtering
    const handleAgentUpdate = (event: AgentUpdateEvent) => {
      const { activeConversationId, activeRequestToken } = get();

      // Direct filtering using new conversationId field - NO REVERSE MAPPING
      if (event.conversationId !== activeConversationId) {
        return; // Ignore events for inactive conversations
      }

      // Race condition safety using active request token
      if (get().activeRequestToken !== activeRequestToken) {
        return; // Ignore stale events from previous conversation selections
      }

      // Update event subscription state
      set((state) => ({
        ...state,
        eventSubscription: {
          ...state.eventSubscription,
          lastEventTime: new Date().toISOString(),
        },
      }));

      // Trigger conversation progression after agent responses
      if (event.status === "complete") {
        const activeChatMode = get().getActiveChatMode();
        if (activeChatMode === "round-robin") {
          try {
            get().handleConversationProgression();
          } catch (error) {
            console.error("Failed to progress conversation:", error);
            // Continue execution - don't disrupt user experience
          }
        }
      }

      // Process event for active conversation (minimal processing for v1)
      // Most event processing is handled by chat store, this is for future message updates
      if (callback) {
        callback(event);
      }
    };

    // Clean up previous subscription
    if (eventCleanupRef) {
      eventCleanupRef();
      eventCleanupRef = null;
    }

    try {
      // Subscribe to events
      eventCleanupRef =
        electronWindow.electronAPI.chat.onAgentUpdate(handleAgentUpdate);

      // Update subscription state
      set((state) => ({
        ...state,
        eventSubscription: {
          ...state.eventSubscription,
          isSubscribed: true,
        },
      }));

      return eventCleanupRef;
    } catch {
      // Failed to subscribe, return null
      set((state) => ({
        ...state,
        eventSubscription: {
          ...state.eventSubscription,
          isSubscribed: false,
        },
      }));
      return null;
    }
  },
}));
