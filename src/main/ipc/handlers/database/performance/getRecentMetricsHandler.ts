import type { PerformanceMetric } from '@shared/types';
import { ipcMain } from 'electron';
import type { QueryStats } from '../../../../database/performance';
import { performanceManager } from '../../../../database/performance';
import { withErrorRecovery } from '../../../../error-recovery';
import type { IpcPerformanceMetrics } from '../../../../performance';
import { ipcPerformanceManager } from '../../../../performance';

/**
 * Handler for getting recent performance metrics
 */
export function getRecentMetricsHandler(): void {
  ipcMain.handle(
    'performance:getRecentMetrics',
    withErrorRecovery(async (_event, count: number = 100): Promise<PerformanceMetric[]> => {
      const metrics: PerformanceMetric[] = [];

      // Get recent database metrics
      const recentQueries: QueryStats[] = await Promise.resolve(
        performanceManager.getAllQueryPerformanceStats(),
      );

      // Convert database metrics
      for (const stats of recentQueries) {
        if (stats.totalExecutions > 0) {
          metrics.push({
            id: `db-${stats.queryName}-${Date.now()}`,
            type: 'database',
            operation: stats.queryName,
            duration: stats.averageTime,
            timestamp: stats.lastExecuted,
            success: true,
            metadata: {
              count: stats.totalExecutions,
              totalTime: stats.totalTime,
              minTime: stats.minTime,
              maxTime: stats.maxTime,
            },
          });
        }
      }

      // Get recent IPC metrics
      const ipcMonitor = ipcPerformanceManager;
      const ipcMetricsMap = await Promise.resolve(ipcMonitor.getMetrics());
      const ipcMetrics: IpcPerformanceMetrics[] = Array.from(
        ipcMetricsMap instanceof Map ? ipcMetricsMap.values() : [ipcMetricsMap],
      );

      // Convert IPC metrics
      for (const metric of ipcMetrics) {
        metrics.push({
          id: `ipc-${metric.channel}-${metric.lastCallTime}`,
          type: 'ipc',
          operation: metric.channel,
          duration: metric.averageTime,
          timestamp: metric.lastCallTime,
          success: metric.successfulCalls > metric.failedCalls,
          metadata: {
            totalCalls: metric.totalCalls,
            successfulCalls: metric.successfulCalls,
            failedCalls: metric.failedCalls,
            slowCalls: metric.slowCalls,
            memoryDelta: metric.memoryDelta,
            totalMemoryDelta: metric.totalMemoryDelta,
          },
        });
      }

      // Sort by timestamp and limit
      metrics.sort((a, b) => b.timestamp - a.timestamp);

      return metrics.slice(0, count);
    }),
  );
}
