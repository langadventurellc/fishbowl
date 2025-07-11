import type { AppState } from '../types';

/**
 * Selects the agent loading state from the store.
 * @param state - The application state
 * @returns Agent loading state
 */
export const selectAgentLoading = (state: AppState) => state.loading;
