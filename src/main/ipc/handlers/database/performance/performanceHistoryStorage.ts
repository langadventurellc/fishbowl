import type { PerformanceHistoryPoint } from '@shared/types';

/**
 * Performance history storage manager
 * Provides centralized access to performance history data and collection state
 */
class PerformanceHistoryStorage {
  // In-memory history storage (in production, this would be persisted)
  private readonly performanceHistory: PerformanceHistoryPoint[] = [];
  private historyCollectionInterval: NodeJS.Timeout | null = null;

  getPerformanceHistory(): PerformanceHistoryPoint[] {
    return this.performanceHistory;
  }

  addPerformancePoint(point: PerformanceHistoryPoint): void {
    this.performanceHistory.push(point);
  }

  clearPerformanceHistory(): void {
    this.performanceHistory.length = 0;
  }

  pushPerformanceHistory(...points: PerformanceHistoryPoint[]): void {
    this.performanceHistory.push(...points);
  }

  getHistoryCollectionInterval(): NodeJS.Timeout | null {
    return this.historyCollectionInterval;
  }

  setHistoryCollectionInterval(interval: NodeJS.Timeout | null): void {
    this.historyCollectionInterval = interval;
  }
}

export const performanceHistoryStorage = new PerformanceHistoryStorage();
