/**
 * Selects the conversation error state
 */

import type { AppState } from '../types';

export const selectConversationError = (state: AppState) => state.error;
