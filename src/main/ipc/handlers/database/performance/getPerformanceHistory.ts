import type { PerformanceHistoryPoint } from '@shared/types';
import { performanceHistoryStorage } from './performanceHistoryStorage';

/**
 * Get performance history for internal use
 */
export function getPerformanceHistory(): PerformanceHistoryPoint[] {
  return [...performanceHistoryStorage.getPerformanceHistory()];
}
