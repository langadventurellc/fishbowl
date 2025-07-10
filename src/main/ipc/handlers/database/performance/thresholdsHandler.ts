import { ipcMain } from 'electron';
import { withErrorRecovery } from '../../../..//error-recovery';
import { getThresholds } from './getThresholds';

/**
 * Handler for getting performance thresholds
 */
export function getThresholdsHandler(): void {
  ipcMain.handle(
    'performance:getThresholds',
    withErrorRecovery(() => {
      return Promise.resolve(getThresholds());
    }),
  );
}
