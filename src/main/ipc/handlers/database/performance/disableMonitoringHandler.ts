import { ipcMain } from 'electron';
import { withErrorRecovery } from '../../../../error-recovery';
import { getMonitoringState } from './getMonitoringState';
import { setMonitoringState } from './setMonitoringState';
import { stopHistoryCollection } from './stopHistoryCollection';

/**
 * Handler for disabling performance monitoring
 */
export function disableMonitoringHandler(): void {
  ipcMain.handle(
    'performance:disableMonitoring',
    withErrorRecovery((_event, category: 'database' | 'ipc' | 'system' | 'all' = 'all') => {
      const state = getMonitoringState();

      if (category === 'all') {
        setMonitoringState({
          database: false,
          ipc: false,
          system: false,
        });
        stopHistoryCollection();
      } else {
        setMonitoringState({
          ...state,
          [category]: false,
        });
        if (!Object.values(getMonitoringState()).some(v => v)) {
          stopHistoryCollection();
        }
      }
      return Promise.resolve();
    }),
  );
}
