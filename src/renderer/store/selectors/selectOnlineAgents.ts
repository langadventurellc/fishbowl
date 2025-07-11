import type { AppState } from '../types';
import { createFilteredArraySelector, registerSelectorForMonitoring } from '../utils/memoization';

/**
 * Selects agents that are currently online.
 * Uses memoized filtering to prevent unnecessary re-renders when agent status hasn't changed.
 * @param state - The application state
 * @returns Array of online agent objects
 */
const selectOnlineAgentsImpl = createFilteredArraySelector(
  (state: AppState) => state.agents,
  (agent, state) => {
    const status = state.agentStatuses[agent.id];
    return status?.isOnline ?? false;
  },
  { enablePerformanceMonitoring: process.env.NODE_ENV === 'development' },
);

// Register for performance monitoring in development
void registerSelectorForMonitoring('selectOnlineAgents', selectOnlineAgentsImpl);

export const selectOnlineAgents = selectOnlineAgentsImpl;
