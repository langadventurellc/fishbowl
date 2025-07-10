import type { AppState } from '../types';

/**
 * Selects the active agent objects from the store.
 * @param state - The application state
 * @returns Array of active agent objects
 */
export const selectActiveAgentObjects = (state: AppState) => {
  return state.agents.filter(agent => state.activeAgents.includes(agent.id));
};
