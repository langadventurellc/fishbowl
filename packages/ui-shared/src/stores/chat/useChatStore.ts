/**
 * Zustand store for managing transient chat UI states during multi-agent processing.
 *
 * Provides reactive state management for temporary states like agent thinking indicators,
 * message sending status, and error states that don't need database persistence.
 *
 * @module stores/chat/useChatStore
 */

import { create } from "zustand";

export interface ChatStore {
  // Transient UI state only
  sendingMessage: boolean;
  agentThinking: Record<string, boolean>; // conversationAgentId -> thinking
  lastError: Record<string, string | null>; // conversationAgentId -> error
  processingConversationId: string | null;

  // Actions
  setSending: (sending: boolean) => void;
  setAgentThinking: (agentId: string, thinking: boolean) => void;
  setAgentError: (agentId: string, error: string | null) => void;
  setProcessingConversation: (conversationId: string | null) => void;
  clearAgentState: (agentId: string) => void;
  clearAllThinking: () => void;
  clearConversationState: () => void;
}

export const useChatStore = create<ChatStore>()((set, _get) => ({
  // Initial state
  sendingMessage: false,
  agentThinking: {},
  lastError: {},
  processingConversationId: null,

  // Actions
  setSending: (sending: boolean) => {
    set({ sendingMessage: sending });
  },

  setAgentThinking: (agentId: string, thinking: boolean) => {
    set((state) => ({
      agentThinking: {
        ...state.agentThinking,
        [agentId]: thinking,
      },
    }));
  },

  setAgentError: (agentId: string, error: string | null) => {
    set((state) => ({
      lastError: {
        ...state.lastError,
        [agentId]: error,
      },
    }));
  },

  setProcessingConversation: (conversationId: string | null) => {
    set({ processingConversationId: conversationId });
  },

  clearAgentState: (agentId: string) => {
    set((state) => {
      const newAgentThinking = { ...state.agentThinking };
      const newLastError = { ...state.lastError };

      delete newAgentThinking[agentId];
      delete newLastError[agentId];

      return {
        agentThinking: newAgentThinking,
        lastError: newLastError,
      };
    });
  },

  clearAllThinking: () => {
    set({ agentThinking: {} });
  },

  clearConversationState: () => {
    set({
      processingConversationId: null,
      agentThinking: {},
      lastError: {},
    });
  },
}));
