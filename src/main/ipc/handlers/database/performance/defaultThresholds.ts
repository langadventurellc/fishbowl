import type { PerformanceThresholds } from '@shared/types';

// Default performance thresholds
export const defaultThresholds: PerformanceThresholds = {
  database: {
    maxQueryTime: 100,
    maxWalSize: 67108864, // 64MB
    minCacheHitRate: 0.7,
    maxFailureRate: 0.05,
  },
  ipc: {
    maxCallDuration: 200,
    maxMemoryUsage: 536870912, // 512MB
    maxFailureRate: 0.05,
  },
  system: {
    maxCpuUsage: 80,
    maxMemoryUsage: 80,
    maxDiskUsage: 90,
  },
};
