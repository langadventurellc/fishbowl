import { monitoringState } from './monitoringStateData';

/**
 * Get monitoring state
 */
export function getMonitoringState(): typeof monitoringState {
  return { ...monitoringState };
}
