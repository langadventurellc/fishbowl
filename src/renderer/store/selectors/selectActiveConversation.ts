/**
 * Selects the active conversation object
 */

import type { AppState } from '../types';

export const selectActiveConversation = (state: AppState) => {
  if (!state.activeConversationId) return null;
  return state.conversations.find(c => c.id === state.activeConversationId) ?? null;
};
