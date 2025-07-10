import { ipcMain } from 'electron';
import { queryMonitor } from '../../../..//database/performance';
import { withErrorRecovery } from '../../../..//error-recovery';
import { ipcPerformanceManager } from '../../../..//performance';

/**
 * Handler for resetting performance metrics
 */
export function resetMetricsHandler(): void {
  ipcMain.handle(
    'performance:resetMetrics',
    withErrorRecovery((_event, category: 'database' | 'ipc' | 'system' | 'all' = 'all') => {
      if (category === 'database' || category === 'all') {
        // Reset database metrics
        queryMonitor.clearMetrics();
      }

      if (category === 'ipc' || category === 'all') {
        // Reset IPC metrics
        ipcPerformanceManager.resetMetrics();
      }

      if (category === 'system' || category === 'all') {
        // System metrics are real-time, so nothing to reset
      }

      return Promise.resolve();
    }),
  );
}
