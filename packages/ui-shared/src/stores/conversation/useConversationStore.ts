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
} from "@fishbowl-ai/shared";
import { useChatStore } from "../chat/useChatStore";

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

export const useConversationStore = create<ConversationStore>()((set, get) => ({
  // Initial state - all arrays empty, loading states false
  activeConversationId: null,
  conversations: [],
  activeMessages: [],
  activeConversationAgents: [],
  activeRequestToken: null,
  maximumMessages: 100,

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

      // Create message (allow empty content for continuation)
      const userMessage = await conversationService.createMessage({
        conversation_id: activeConversationId,
        content: content || "",
        role: "user",
      });

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
        set((state) => ({
          ...state,
          activeConversationAgents: [
            ...state.activeConversationAgents,
            conversationAgent,
          ],
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
      // Find agent in activeConversationAgents by ID
      const agents = get().activeConversationAgents;
      const agent = agents.find((a) => a.id === conversationAgentId);
      if (!agent) {
        throw new Error("Agent not found in active conversation");
      }

      set((state) => ({
        ...state,
        loading: { ...state.loading, agents: true },
        error: { ...state.error, agents: undefined },
      }));

      // Toggle enabled property via service
      const updatedAgent: ConversationAgent =
        await conversationService.updateConversationAgent(conversationAgentId, {
          enabled: !agent.enabled,
        });

      // Update the specific agent in activeConversationAgents array
      set((state) => ({
        ...state,
        activeConversationAgents: state.activeConversationAgents.map((a) =>
          a.id === conversationAgentId ? updatedAgent : a,
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
}));
