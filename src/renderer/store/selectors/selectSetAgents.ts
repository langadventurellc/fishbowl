import type { AppState } from '../types';

/**
 * Selects the setAgents action from the store.
 * @param state - The application state
 * @returns The setAgents action function
 */
export const selectSetAgents = (state: AppState) => state.setAgents;
