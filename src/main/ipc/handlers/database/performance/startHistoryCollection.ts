import type { PerformanceHistoryPoint } from '@shared/types';
import { performanceManager } from '@main/database/performance';
import { ipcPerformanceManager } from '@main/performance';
import { performanceHistoryStorage } from './performanceHistoryStorage';

/**
 * Start collecting performance history
 */
export function startHistoryCollection(): void {
  if (performanceHistoryStorage.getHistoryCollectionInterval()) return;

  // Collect performance data every minute
  performanceHistoryStorage.setHistoryCollectionInterval(
    setInterval(() => {
      void (async () => {
        try {
          const dbReport = await Promise.resolve(performanceManager.generatePerformanceReport());
          const ipcReport = ipcPerformanceManager.generateReport();

          const historyPoint: PerformanceHistoryPoint = {
            timestamp: Date.now(),
            database: {
              queryTime: dbReport.summary.averageExecutionTime,
              queryCount: dbReport.summary.totalQueries,
              cacheHitRate: 0, // Note: Cache hit rate not available in current report structure
            },
            ipc: {
              callDuration: ipcReport.averageTime,
              callCount: ipcReport.totalCalls,
              memoryUsage: ipcReport.totalMemoryDelta,
            },
            system: {
              cpuUsage: process.cpuUsage().user / 1000000,
              memoryUsage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100,
            },
          };

          performanceHistoryStorage.addPerformancePoint(historyPoint);

          // Keep only last 24 hours of data
          const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
          const currentHistory = performanceHistoryStorage.getPerformanceHistory();
          const filteredHistory = currentHistory.filter(point => point.timestamp > dayAgo);
          performanceHistoryStorage.clearPerformanceHistory();
          performanceHistoryStorage.pushPerformanceHistory(...filteredHistory);
        } catch (error) {
          console.error('Error collecting performance history:', error);
        }
      })();
    }, 60000),
  ); // Every minute
}
