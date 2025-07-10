import type { AppState } from '../types';

/**
 * Selects the total count of agents.
 * @param state - The application state
 * @returns Total number of agents
 */
export const selectAgentCount = (state: AppState) => state.agents.length;
