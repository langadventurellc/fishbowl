/**
 * Conversation slice for Zustand store
 *
 * Manages conversation-related state including:
 * - Conversation list and metadata
 * - Active conversation tracking
 * - Conversation operations (CRUD)
 * - Loading and error states
 * - Conversation state caching
 */

import type { StoreSlice, ConversationSlice, Conversation } from '../types';

/**
 * Conversation slice default values
 */
const defaultConversations: Conversation[] = [];
const defaultActiveConversationId: string | null = null;
const defaultLoading = false;
const defaultError: string | null = null;

/**
 * Create conversation slice with all conversation-related state and actions
 */
export const createConversationSlice: StoreSlice<ConversationSlice> = (set, _get) => ({
  // Conversation state
  conversations: defaultConversations,
  activeConversationId: defaultActiveConversationId,
  loading: defaultLoading,
  error: defaultError,

  // Conversation list actions
  setConversations: (conversations: Conversation[]) => {
    set(state => {
      state.conversations = conversations;
      state.error = null;
    });
  },

  addConversation: (conversation: Conversation) => {
    set(state => {
      // Check if conversation already exists
      const existingIndex = state.conversations.findIndex(c => c.id === conversation.id);
      if (existingIndex >= 0) {
        // Update existing conversation
        state.conversations[existingIndex] = conversation;
      } else {
        // Add new conversation to the beginning of the list
        state.conversations.unshift(conversation);
      }
      state.error = null;
    });
  },

  updateConversation: (id: string, updates: Partial<Conversation>) => {
    set(state => {
      const conversationIndex = state.conversations.findIndex(c => c.id === id);
      if (conversationIndex >= 0) {
        state.conversations[conversationIndex] = {
          ...state.conversations[conversationIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        state.error = null;
      } else {
        state.error = `Conversation with ID ${id} not found`;
      }
    });
  },

  removeConversation: (id: string) => {
    set(state => {
      const conversationIndex = state.conversations.findIndex(c => c.id === id);
      if (conversationIndex >= 0) {
        state.conversations.splice(conversationIndex, 1);

        // Clear active conversation if it was removed
        if (state.activeConversationId === id) {
          state.activeConversationId = null;
        }

        state.error = null;
      } else {
        state.error = `Conversation with ID ${id} not found`;
      }
    });
  },

  // Active conversation actions
  setActiveConversation: (id: string | null) => {
    set(state => {
      if (id === null) {
        state.activeConversationId = null;
        state.error = null;
      } else {
        // Validate that conversation exists
        const conversationExists = state.conversations.some(c => c.id === id);
        if (conversationExists) {
          state.activeConversationId = id;
          state.error = null;
        } else {
          state.error = `Conversation with ID ${id} not found`;
        }
      }
    });
  },

  // Loading state actions
  setLoading: (loading: boolean) => {
    set(state => {
      state.loading = loading;
    });
  },

  // Error state actions
  setError: (error: string | null) => {
    set(state => {
      state.error = error;
    });
  },
});
