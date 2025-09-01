/**
 * Core conversation store with Zustand and service injection.
 *
 * Manages complete conversation lifecycle including conversation list management,
 * message operations, agent coordination, and service integration with race
 * condition protection and dependency injection.
 */

import { create } from "zustand";
import type { ConversationStore } from "./ConversationStore";
import type { ConversationService } from "@fishbowl-ai/shared";
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

    const messageContent = content?.trim() || "";
    if (!messageContent) {
      return; // Don't send empty messages
    }

    try {
      set((state) => ({
        ...state,
        loading: { ...state.loading, sending: true },
        error: { ...state.error, sending: undefined },
      }));

      // Create message
      const userMessage = await conversationService.createMessage({
        conversation_id: activeConversationId,
        content: messageContent,
        role: "user",
      });

      // Refresh conversation to get latest messages
      await get().refreshActiveConversation();

      // Trigger orchestration
      await conversationService.sendToAgents(
        activeConversationId,
        userMessage.id,
      );

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
   * Add agent to conversation.
   */
  addAgent: async (conversationId: string, agentId: string) => {
    if (!conversationService) {
      throw new Error("ConversationService not initialized");
    }

    try {
      await conversationService.addAgent(conversationId, agentId);

      // Refresh active conversation if it matches
      if (get().activeConversationId === conversationId) {
        await get().refreshActiveConversation();
      }
    } catch (error) {
      set((state) => ({
        ...state,
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
  },

  /**
   * Remove agent from conversation.
   */
  removeAgent: async (conversationId: string, agentId: string) => {
    if (!conversationService) {
      throw new Error("ConversationService not initialized");
    }

    try {
      await conversationService.removeAgent(conversationId, agentId);

      // Refresh active conversation if it matches
      if (get().activeConversationId === conversationId) {
        await get().refreshActiveConversation();
      }
    } catch (error) {
      set((state) => ({
        ...state,
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
    if (!conversationService) {
      throw new Error("ConversationService not initialized");
    }

    try {
      // Get current agent state and toggle enabled
      const agents = get().activeConversationAgents;
      const agent = agents.find((a) => a.id === conversationAgentId);
      if (!agent) {
        throw new Error("Agent not found in active conversation");
      }

      await conversationService.updateConversationAgent(conversationAgentId, {
        enabled: !agent.enabled,
      });

      // Refresh active conversation to get updated agent states
      await get().refreshActiveConversation();
    } catch (error) {
      set((state) => ({
        ...state,
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
