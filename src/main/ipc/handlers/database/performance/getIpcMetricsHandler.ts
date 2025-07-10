import type { IpcPerformanceMetrics } from '@shared/types';
import { ipcMain } from 'electron';
import { withErrorRecovery } from '../../../../error-recovery';
import { ipcPerformanceManager } from '../../../../performance';

/**
 * Handler for getting IPC performance metrics
 */
export function getIpcMetricsHandler(): void {
  ipcMain.handle(
    'performance:getIpcMetrics',
    withErrorRecovery(async () => {
      const report = ipcPerformanceManager.generateReport();

      // Calculate failed calls from channel metrics
      const totalFailedCalls = Object.values(report.channelMetrics).reduce(
        (sum, metrics) => sum + metrics.failedCalls,
        0,
      );

      // Create channel distribution from channel metrics
      const channelDistribution = Object.fromEntries(
        Object.entries(report.channelMetrics).map(([channel, metrics]) => [
          channel,
          metrics.totalCalls,
        ]),
      );

      const metrics: IpcPerformanceMetrics = {
        totalCalls: report.totalCalls,
        averageCallDuration: report.averageTime,
        slowCalls: report.totalSlowCalls,
        failedCalls: totalFailedCalls,
        channelDistribution,
        memoryUsage: report.totalMemoryDelta,
        activeHandlers: Object.keys(report.channelMetrics).length,
      };

      return await Promise.resolve(metrics);
    }),
  );
}
