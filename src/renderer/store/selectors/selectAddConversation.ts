/**
 * Selects the addConversation action
 */

import type { AppState } from '../types';

export const selectAddConversation = (state: AppState) => state.addConversation;
