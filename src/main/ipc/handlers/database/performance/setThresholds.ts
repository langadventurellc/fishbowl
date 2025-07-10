import type { PerformanceThresholds } from '@shared/types';
import { currentThresholds } from './currentThresholds';

/**
 * Set performance thresholds
 */
export function setThresholds(thresholds: Partial<PerformanceThresholds>): void {
  // Merge new thresholds with current ones
  if (thresholds.database) {
    Object.assign(currentThresholds.database, thresholds.database);
  }

  if (thresholds.ipc) {
    Object.assign(currentThresholds.ipc, thresholds.ipc);
  }

  if (thresholds.system) {
    Object.assign(currentThresholds.system, thresholds.system);
  }
}
