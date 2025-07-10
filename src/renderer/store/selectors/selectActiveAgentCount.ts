import type { AppState } from '../types';

/**
 * Selects the count of active agents.
 * @param state - The application state
 * @returns Number of active agents
 */
export const selectActiveAgentCount = (state: AppState) => state.activeAgents.length;
