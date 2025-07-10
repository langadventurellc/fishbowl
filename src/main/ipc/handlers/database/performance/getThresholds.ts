import type { PerformanceThresholds } from '@shared/types';
import { currentThresholds } from './currentThresholds';

/**
 * Get current performance thresholds
 */
export function getThresholds(): PerformanceThresholds {
  return { ...currentThresholds };
}
