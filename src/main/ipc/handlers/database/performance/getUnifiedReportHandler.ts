import type { UnifiedPerformanceReport } from '@shared/types';
import { ipcMain } from 'electron';
import { performanceManager } from '../../../../database/performance';
import { withErrorRecovery } from '../../../../error-recovery';
import { ipcPerformanceManager } from '../../../../performance';

/**
 * Handler for getting unified performance report
 */
export function getUnifiedReportHandler(): void {
  ipcMain.handle(
    'performance:getUnifiedReport',
    withErrorRecovery(() => {
      // Get database performance metrics
      const dbReport = performanceManager.generatePerformanceReport();
      const dbMetrics = {
        totalQueries: dbReport.summary.totalQueries,
        averageQueryTime: dbReport.summary.averageExecutionTime,
        slowQueries: dbReport.slowQueries.length,
        failedQueries: 0,
        queryDistribution: {},
        cacheHitRate: 0,
        walSize: 0,
        lastCheckpoint: 0,
        databaseSize: dbReport.databaseSize.totalSize,
        connectionCount: 1,
      };

      // Get IPC performance metrics
      const ipcReport = ipcPerformanceManager.generateReport();
      const ipcMetrics = {
        totalCalls: ipcReport.totalCalls,
        averageCallDuration: ipcReport.averageTime,
        slowCalls: ipcReport.totalSlowCalls,
        failedCalls: 0, // Not available in current report structure
        channelDistribution: Object.fromEntries(
          Object.entries(ipcReport.channelMetrics).map(([channel, metrics]) => [
            channel,
            metrics.totalCalls,
          ]),
        ),
        memoryUsage: ipcReport.totalMemoryDelta,
        activeHandlers: Object.keys(ipcReport.channelMetrics).length,
      };

      // Get system performance metrics
      const systemMetrics = {
        cpuUsage: process.cpuUsage().user / 1000000,
        memoryUsage: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          percentage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100,
        },
        diskUsage: {
          used: 0,
          total: 0,
          percentage: 0,
        },
        uptime: process.uptime(),
      };

      // Combine alerts from both systems
      const alerts: UnifiedPerformanceReport['alerts'] = [];

      // Database alerts
      if (dbReport.summary.averageExecutionTime > 50) {
        alerts.push({
          id: `db-slow-${Date.now()}`,
          type: 'warning',
          category: 'database',
          message: `Average query time (${dbReport.summary.averageExecutionTime}ms) exceeds threshold`,
          timestamp: Date.now(),
          threshold: 50,
          actualValue: dbReport.summary.averageExecutionTime,
          resolved: false,
        });
      }

      // IPC alerts
      if (ipcReport.averageTime > 100) {
        alerts.push({
          id: `ipc-slow-${Date.now()}`,
          type: 'warning',
          category: 'ipc',
          message: `Average IPC call duration (${ipcReport.averageTime}ms) exceeds threshold`,
          timestamp: Date.now(),
          threshold: 100,
          actualValue: ipcReport.averageTime,
          resolved: false,
        });
      }

      // System alerts
      if (systemMetrics.memoryUsage.percentage > 80) {
        alerts.push({
          id: `sys-mem-${Date.now()}`,
          type: 'error',
          category: 'system',
          message: `Memory usage (${systemMetrics.memoryUsage.percentage.toFixed(1)}%) exceeds threshold`,
          timestamp: Date.now(),
          threshold: 80,
          actualValue: systemMetrics.memoryUsage.percentage,
          resolved: false,
        });
      }

      // Combine recommendations
      const recommendations: string[] = [...dbReport.recommendations, ...ipcReport.recommendations];

      const unifiedReport: UnifiedPerformanceReport = {
        timestamp: Date.now(),
        duration: 0,
        database: dbMetrics,
        ipc: ipcMetrics,
        system: systemMetrics,
        alerts,
        recommendations,
      };

      return Promise.resolve(unifiedReport);
    }),
  );
}
