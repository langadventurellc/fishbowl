import type { AppState } from '../types';
import { createFilteredArraySelector, registerSelectorForMonitoring } from '../utils/memoization';

/**
 * Selects the active agent objects from the store.
 * Uses memoized filtering to prevent unnecessary re-renders when agent data hasn't changed.
 * @param state - The application state
 * @returns Array of active agent objects
 */
const selectActiveAgentObjectsImpl = createFilteredArraySelector(
  (state: AppState) => state.agents,
  (agent, state) => state.activeAgents.includes(agent.id),
  { enablePerformanceMonitoring: process.env.NODE_ENV === 'development' },
);

// Register for performance monitoring in development
void registerSelectorForMonitoring('selectActiveAgentObjects', selectActiveAgentObjectsImpl);

export const selectActiveAgentObjects = selectActiveAgentObjectsImpl;
