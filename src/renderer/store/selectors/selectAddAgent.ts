import type { AppState } from '../types';

/**
 * Selects the addAgent action from the store.
 * @param state - The application state
 * @returns The addAgent action function
 */
export const selectAddAgent = (state: AppState) => state.addAgent;
