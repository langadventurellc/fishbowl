import type { AppState } from '../types';

/**
 * Selects the agent error state from the store.
 * @param state - The application state
 * @returns Agent error state
 */
export const selectAgentError = (state: AppState) => state.error;
