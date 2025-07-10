import { performanceHistoryStorage } from './performanceHistoryStorage';

/**
 * Stop collecting performance history
 */
export function stopHistoryCollection(): void {
  const interval = performanceHistoryStorage.getHistoryCollectionInterval();
  if (interval) {
    clearInterval(interval);
    performanceHistoryStorage.setHistoryCollectionInterval(null);
  }
}
