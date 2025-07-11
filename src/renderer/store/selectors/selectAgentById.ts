import type { AppState } from '../types';
import { createFindByIdSelector, registerSelectorForMonitoring } from '../utils/memoization';

/**
 * Creates a memoized selector to find an agent by ID.
 * Uses parameterized memoization to cache results for different agent IDs.
 * @param id - The agent ID to find
 * @returns A memoized selector function that returns the agent or undefined
 */
const selectAgentByIdImpl = createFindByIdSelector((state: AppState) => state.agents, {
  enablePerformanceMonitoring: process.env.NODE_ENV === 'development',
  maxCacheSize: 50, // Cache results for up to 50 different agent IDs
});

// Register for performance monitoring in development
void registerSelectorForMonitoring('selectAgentById', selectAgentByIdImpl);

export const selectAgentById = selectAgentByIdImpl;
