import { ipcMain } from 'electron';
import { withErrorRecovery } from '@main/error-recovery';
import { getMonitoringState } from './getMonitoringState';
import { setMonitoringState } from './setMonitoringState';
import { startHistoryCollection } from './startHistoryCollection';

/**
 * Handler for enabling performance monitoring
 */
export function enableMonitoringHandler(): void {
  ipcMain.handle(
    'performance:enableMonitoring',
    withErrorRecovery((_event, category: 'database' | 'ipc' | 'system' | 'all' = 'all') => {
      const state = getMonitoringState();

      if (category === 'all') {
        setMonitoringState({
          database: true,
          ipc: true,
          system: true,
        });
        startHistoryCollection();
      } else {
        setMonitoringState({
          ...state,
          [category]: true,
        });
        if (Object.values(getMonitoringState()).some(v => v)) {
          startHistoryCollection();
        }
      }
      return Promise.resolve();
    }),
  );
}
