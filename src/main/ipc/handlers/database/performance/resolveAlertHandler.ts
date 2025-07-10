import { ipcMain } from 'electron';
import { withErrorRecovery } from '../../../..//error-recovery';
import { getPerformanceAlerts } from './getPerformanceAlerts';

/**
 * Handler for resolving performance alert
 */
export function resolveAlertHandler(): void {
  ipcMain.handle(
    'performance:resolveAlert',
    withErrorRecovery((_event, alertId: string) => {
      const alerts = getPerformanceAlerts();
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.resolved = true;
      }
      return Promise.resolve();
    }),
  );
}
