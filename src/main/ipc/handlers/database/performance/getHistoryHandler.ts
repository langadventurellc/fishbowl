import { ipcMain } from 'electron';
import { withErrorRecovery } from '../../../../error-recovery';
import { getPerformanceHistory } from './getPerformanceHistory';

/**
 * Handler for getting performance history
 */
export function getHistoryHandler(): void {
  ipcMain.handle(
    'performance:getHistory',
    withErrorRecovery(async (_event, duration: number = 3600000) => {
      // Default to last hour
      const cutoffTime = Date.now() - duration;
      const history = getPerformanceHistory();

      return await Promise.resolve(history.filter(point => point.timestamp >= cutoffTime));
    }),
  );
}
