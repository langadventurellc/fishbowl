import type { PerformanceThresholds } from '@shared/types';
import { ipcMain } from 'electron';
import { withErrorRecovery } from '../../../..//error-recovery';
import { setThresholds } from './setThresholds';

/**
 * Handler for setting performance thresholds
 */
export function setThresholdsHandler(): void {
  ipcMain.handle(
    'performance:setThresholds',
    withErrorRecovery((_event, thresholds: Partial<PerformanceThresholds>) => {
      setThresholds(thresholds);
      return Promise.resolve();
    }),
  );
}
