/**
 * Selects the list of all conversations
 */

import type { AppState } from '../types';

export const selectConversations = (state: AppState) => state.conversations;
