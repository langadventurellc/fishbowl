import type { AppState } from '../types';

/**
 * Selects all agent metadata from the store.
 * @param state - The application state
 * @returns Record of agent metadata
 */
export const selectAgentMetadata = (state: AppState) => state.agentMetadata;
