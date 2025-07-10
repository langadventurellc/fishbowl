import type { AppState } from '../types';

/**
 * Selects the active agent IDs from the store.
 * @param state - The application state
 * @returns Array of active agent IDs
 */
export const selectActiveAgents = (state: AppState) => state.activeAgents;
