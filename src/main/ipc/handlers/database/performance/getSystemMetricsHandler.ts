import { ipcMain } from 'electron';
import type { SystemPerformanceMetrics } from '@shared/types';
import { withErrorRecovery } from '@main/error-recovery';
import os from 'os';

/**
 * Handler for getting system performance metrics
 */
export function getSystemMetricsHandler(): void {
  ipcMain.handle(
    'performance:getSystemMetrics',
    withErrorRecovery(() => {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;

      const metrics: SystemPerformanceMetrics = {
        cpuUsage: process.cpuUsage().user / 1000000,
        memoryUsage: {
          used: usedMem,
          total: totalMem,
          percentage: (usedMem / totalMem) * 100,
        },
        diskUsage: {
          used: 0,
          total: 0,
          percentage: 0,
        },
        uptime: process.uptime(),
      };

      return Promise.resolve(metrics);
    }),
  );
}
