import type { AppState } from '../types';

/**
 * Selects agents that are currently online.
 * @param state - The application state
 * @returns Array of online agent objects
 */
export const selectOnlineAgents = (state: AppState) => {
  return state.agents.filter(agent => {
    const status = state.agentStatuses[agent.id];
    return status?.isOnline ?? false;
  });
};
