import { monitoringState } from './monitoringStateData';

/**
 * Internal function to update monitoring state
 */
export function updateMonitoringState(state: Partial<typeof monitoringState>): void {
  Object.assign(monitoringState, state);
}
