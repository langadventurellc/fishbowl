import { updateMonitoringState } from './monitoringStateInternal';
import { monitoringState } from './monitoringStateData';

/**
 * Set monitoring state
 */
export function setMonitoringState(state: Partial<typeof monitoringState>): void {
  updateMonitoringState(state);
}
