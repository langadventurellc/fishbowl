import type { DatabasePerformanceMetrics } from '@shared/types';
import { ipcMain } from 'electron';
import { performanceManager } from '../../../../database/performance';
import { withErrorRecovery } from '../../../../error-recovery';

/**
 * Handler for getting database performance metrics
 */
export function getDatabaseMetricsHandler(): void {
  ipcMain.handle(
    'performance:getDatabaseMetrics',
    withErrorRecovery(async () => {
      const report = performanceManager.generatePerformanceReport();

      const metrics: DatabasePerformanceMetrics = {
        totalQueries: report.summary.totalQueries,
        averageQueryTime: report.summary.averageExecutionTime,
        slowQueries: report.slowQueries.length,
        failedQueries: 0,
        queryDistribution: {},
        cacheHitRate: 0,
        walSize: 0,
        lastCheckpoint: 0,
        databaseSize: report.databaseSize.totalSize,
        connectionCount: 1,
      };

      return await Promise.resolve(metrics);
    }),
  );
}
