import type { AppState } from '../types';

/**
 * Selects the last fetch timestamp from the store.
 * @param state - The application state
 * @returns Last fetch timestamp or null
 */
export const selectLastFetch = (state: AppState) => state.lastFetch;
