import type { AppState } from '../types';
import { createCountSelector, registerSelectorForMonitoring } from '../utils/memoization';

/**
 * Selects the count of online agents.
 * Uses memoized counting to prevent unnecessary recalculation when agent status hasn't changed.
 * @param state - The application state
 * @returns Number of online agents
 */
const selectOnlineAgentCountImpl = createCountSelector(
  (state: AppState) => state.agents,
  (agent, state) => {
    const status = state.agentStatuses[agent.id];
    return status?.isOnline ?? false;
  },
  { enablePerformanceMonitoring: process.env.NODE_ENV === 'development' },
);

// Register for performance monitoring in development
void registerSelectorForMonitoring('selectOnlineAgentCount', selectOnlineAgentCountImpl);

export const selectOnlineAgentCount = selectOnlineAgentCountImpl;
