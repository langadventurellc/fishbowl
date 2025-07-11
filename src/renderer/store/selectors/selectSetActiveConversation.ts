/**
 * Selects the setActiveConversation action
 */

import type { AppState } from '../types';

export const selectSetActiveConversation = (state: AppState) => state.setActiveConversation;
