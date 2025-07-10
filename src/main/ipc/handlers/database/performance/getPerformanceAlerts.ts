import type { PerformanceAlert } from '@shared/types';
import { performanceAlerts } from './performanceAlertsStore';

/**
 * Get all alerts for internal use
 */
export function getPerformanceAlerts(): PerformanceAlert[] {
  return [...performanceAlerts];
}
