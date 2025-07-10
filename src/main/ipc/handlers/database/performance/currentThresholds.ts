import type { PerformanceThresholds } from '@shared/types';
import { defaultThresholds } from './defaultThresholds';

// Current thresholds
export const currentThresholds: PerformanceThresholds = { ...defaultThresholds };
