import type { AppState } from '../types';

/**
 * Selects all agents from the store.
 * @param state - The application state
 * @returns Array of all agents
 */
export const selectAgents = (state: AppState) => state.agents;
