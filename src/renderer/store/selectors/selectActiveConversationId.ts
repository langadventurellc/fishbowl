/**
 * Selects the active conversation ID
 */

import type { AppState } from '../types';

export const selectActiveConversationId = (state: AppState) => state.activeConversationId;
