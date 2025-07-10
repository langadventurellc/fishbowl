import type { AppState } from '../types';

/**
 * Creates a selector to find an agent by ID.
 * @param id - The agent ID to find
 * @returns A selector function that returns the agent or null if not found
 */
export const selectAgentById = (id: string) => (state: AppState) => {
  return state.agents.find(agent => agent.id === id) ?? null;
};
