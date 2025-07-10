import type { AppState } from '../types';

/**
 * Selects the count of online agents.
 * @param state - The application state
 * @returns Number of online agents
 */
export const selectOnlineAgentCount = (state: AppState) => {
  return state.agents.filter(agent => {
    const status = state.agentStatuses[agent.id];
    return status?.isOnline ?? false;
  }).length;
};
