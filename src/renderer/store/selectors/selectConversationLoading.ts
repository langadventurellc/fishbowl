/**
 * Selects the conversation loading state
 */

import type { AppState } from '../types';

export const selectConversationLoading = (state: AppState) => state.loading;
