import type { PerformanceAlert } from '@shared/types';
import { performanceAlerts } from './performanceAlertsStore';

/**
 * Add a performance alert
 */
export function addPerformanceAlert(alert: PerformanceAlert): void {
  performanceAlerts.push(alert);

  // Keep only last 1000 alerts
  if (performanceAlerts.length > 1000) {
    performanceAlerts.splice(0, performanceAlerts.length - 1000);
  }
}
