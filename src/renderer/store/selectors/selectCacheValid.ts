import type { AppState } from '../types';

/**
 * Selects the cache validity state from the store.
 * @param state - The application state
 * @returns Cache validity state
 */
export const selectCacheValid = (state: AppState) => state.cacheValid;
