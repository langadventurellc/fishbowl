import type { IpcPerformanceMetrics } from './IpcPerformanceMetrics';

export interface OptimizationRule {
  name: string;
  condition: (metrics: IpcPerformanceMetrics) => boolean;
  action: (channel: string, metrics: IpcPerformanceMetrics) => Promise<void>;
  priority: number;
}
