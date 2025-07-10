import { ipcMain } from 'electron';
import { withErrorRecovery } from '@main/error-recovery';
import { getPerformanceAlerts } from './getPerformanceAlerts';

/**
 * Handler for getting performance alerts
 */
export function getAlertsHandler(): void {
  ipcMain.handle(
    'performance:getAlerts',
    withErrorRecovery(async (_event, unresolved: boolean = false) => {
      const alerts = getPerformanceAlerts();
      if (unresolved) {
        return await Promise.resolve(alerts.filter(alert => !alert.resolved));
      }
      return await Promise.resolve(alerts);
    }),
  );
}
