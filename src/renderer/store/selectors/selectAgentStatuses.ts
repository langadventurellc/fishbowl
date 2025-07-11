import type { AppState } from '../types';

/**
 * Selects all agent statuses from the store.
 * @param state - The application state
 * @returns Record of agent statuses
 */
export const selectAgentStatuses = (state: AppState) => state.agentStatuses;
