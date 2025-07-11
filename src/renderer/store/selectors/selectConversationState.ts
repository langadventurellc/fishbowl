/**
 * Selects comprehensive conversation state and actions
 * Uses a cached result to prevent infinite loops in React components.
 */

import type { AppState } from '../types';

type ConversationStateResult = {
  conversations: AppState['conversations'];
  activeConversationId: AppState['activeConversationId'];
  activeConversation: AppState['conversations'][0] | null;
  loading: AppState['loading'];
  error: AppState['error'];
  setConversations: AppState['setConversations'];
  addConversation: AppState['addConversation'];
  updateConversation: AppState['updateConversation'];
  removeConversation: AppState['removeConversation'];
  setActiveConversation: AppState['setActiveConversation'];
  setLoading: AppState['setLoading'];
  setError: AppState['setError'];
};

let cachedResult: ConversationStateResult | null = null;
let lastState: AppState | null = null;

export const selectConversationState = (state: AppState): ConversationStateResult => {
  // Check if we can return cached result
  if (lastState === state && cachedResult) {
    return cachedResult;
  }

  // Create new result
  cachedResult = {
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
  };

  lastState = state;
  return cachedResult;
};
