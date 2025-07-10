/**
 * Selects comprehensive conversation state and actions
 */

import type { AppState } from '../types';

export const selectConversationState = (state: AppState) => ({
  conversations: state.conversations,
  activeConversationId: state.activeConversationId,
  activeConversation: state.activeConversationId
    ? (state.conversations.find(c => c.id === state.activeConversationId) ?? null)
    : null,
  loading: state.loading,
  error: state.error,
  setConversations: state.setConversations,
  addConversation: state.addConversation,
  updateConversation: state.updateConversation,
  removeConversation: state.removeConversation,
  setActiveConversation: state.setActiveConversation,
  setLoading: state.setLoading,
  setError: state.setError,
});
